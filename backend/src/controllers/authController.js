const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const {
  sendVerificationEmail,
  sendResetOtpEmail,
} = require("../services/emailService");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
const OTP_EXPIRY_MS = 10 * 60 * 1000;

// In-memory store: email -> { codeHash, expiresAt }
// (matches the existing OTP pattern; good enough for a single server)
const verificationCodeStore = new Map();
const resetOtpStore = new Map();

/**
 * Generate a 6-digit numeric code.
 */
const generateCode = () => String(Math.floor(100000 + Math.random() * 900000));

/**
 * Register a new user.
 * - Creates the account with is_verified = false
 * - Sends a verification code by email
 */
const register = async (req, res) => {
  const { name, email, password } = req.body;

  // Validation: Check if all required fields are provided
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Validation: Password must be at least 6 characters long
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  try {
    // Check if user already exists in database
    const [existingUser] = await pool.query(
      "SELECT id, is_verified FROM users WHERE email = ?",
      [email],
    );

    if (existingUser.length > 0) {
      // If already verified, block re-registration.
      if (existingUser[0].is_verified) {
        return res.status(400).json({ message: "Email already exists" });
      }
      // If not verified yet, allow them to re-trigger verification instead
      // of creating a duplicate row.
      return res.status(409).json({
        message: "Account exists but email is not verified.",
        needsVerification: true,
        email,
      });
    }

    // Hash the password using bcryptjs
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database with default role 'user'
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, role, is_verified) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, "user", false],
    );

    // Generate + send verification code
    const code = generateCode();
    const codeHash = await bcrypt.hash(code, 10);
    verificationCodeStore.set(email, {
      codeHash,
      expiresAt: Date.now() + OTP_EXPIRY_MS,
    });

    const emailSent = await sendVerificationEmail(email, code);

    if (!emailSent) {
      // SMTP not configured - return the code in the response for dev use.
      return res.status(201).json({
        message:
          "Account created, but SMTP is not configured. Use the dev code to verify.",
        userId: result.insertId,
        needsVerification: true,
        debugCode: code,
      });
    }

    return res.status(201).json({
      message:
        "Account created. A verification code was sent to your email.",
      userId: result.insertId,
      needsVerification: true,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};

/**
 * Verify the email verification code sent at registration.
 */
const verifyEmail = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({
      message: "Email and verification code are required",
    });
  }

  try {
    const codeData = verificationCodeStore.get(email);

    if (!codeData) {
      return res.status(400).json({
        message:
          "No verification code found. Please request a new code.",
      });
    }

    if (Date.now() > codeData.expiresAt) {
      verificationCodeStore.delete(email);
      return res.status(400).json({
        message: "Verification code expired. Please request a new one.",
      });
    }

    const isValid = await bcrypt.compare(String(code), codeData.codeHash);

    if (!isValid) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    const [users] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );

    if (users.length === 0) {
      verificationCodeStore.delete(email);
      return res.status(404).json({ message: "Email not registered" });
    }

    await pool.query("UPDATE users SET is_verified = ? WHERE email = ?", [
      true,
      email,
    ]);

    verificationCodeStore.delete(email);

    return res.json({
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return res.status(500).json({
      message: "Email verification failed",
      error: error.message,
    });
  }
};

/**
 * Resend the email verification code.
 */
const resendVerificationCode = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const [users] = await pool.query(
      "SELECT id, is_verified FROM users WHERE email = ?",
      [email],
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "Email not registered. Please sign up first.",
      });
    }

    if (users[0].is_verified) {
      return res.status(400).json({
        message: "Email is already verified. You can log in.",
      });
    }

    const code = generateCode();
    const codeHash = await bcrypt.hash(code, 10);
    verificationCodeStore.set(email, {
      codeHash,
      expiresAt: Date.now() + OTP_EXPIRY_MS,
    });

    const emailSent = await sendVerificationEmail(email, code);

    if (!emailSent && process.env.NODE_ENV === "production") {
      return res.status(500).json({
        message:
          "Unable to send verification email right now. Please try again later.",
      });
    }

    return res.json({
      message: emailSent
        ? "Verification code sent to your email."
        : "SMTP not configured. Development code returned in response.",
      ...(emailSent ? {} : { debugCode: code }),
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return res.status(500).json({
      message: "Failed to resend verification code",
      error: error.message,
    });
  }
};

/**
 * Login user and generate JWT token.
 * Blocks unverified users (returns needsVerification so the frontend can
 * show the verification UI).
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  // Validation: Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    console.log("📧 Login attempt:", email);

    // Find user by email
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      console.log("❌ User not found:", email);
      return res.status(404).json({
        message: "Email not registered. Please sign up first.",
      });
    }

    const user = users[0];
    console.log("✅ User found:", user.name);

    // Check password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log("❌ Password mismatch for user:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Require email verification before login is allowed.
    if (!user.is_verified) {
      console.log("⚠️  Email not verified:", email);
      return res.status(403).json({
        message: "Please verify your email before logging in.",
        needsVerification: true,
        email: user.email,
      });
    }

    console.log("✅ Password match! Generating token...");

    // Generate JWT token (include user id, email, and role for identification)
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    console.log("✅ Login successful for:", email);

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

/**
 * Request password reset OTP for an existing account
 */
const requestPasswordResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email is required",
    });
  }

  try {
    const [users] = await pool.query("SELECT id FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res.status(404).json({
        message: "Email not registered. Please sign up first.",
      });
    }

    const otp = generateCode();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = Date.now() + OTP_EXPIRY_MS;

    resetOtpStore.set(email, {
      otpHash,
      expiresAt,
    });

    const emailSent = await sendResetOtpEmail(email, otp);

    // Development fallback when SMTP is not configured.
    if (!emailSent && process.env.NODE_ENV === "production") {
      return res.status(500).json({
        message: "Unable to send OTP email right now. Please try again later.",
      });
    }

    return res.json({
      message: emailSent
        ? "OTP sent to your email."
        : "SMTP not configured. Development OTP returned in response.",
      ...(emailSent ? {} : { debugOtp: otp }),
    });
  } catch (error) {
    console.error("Request OTP error:", error);
    return res.status(500).json({
      message: "Failed to send password reset OTP",
      error: error.message,
    });
  }
};

/**
 * Verify OTP and reset password
 */
const verifyPasswordResetOtp = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      message: "Email, OTP and new password are required",
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      message: "New password must be at least 6 characters",
    });
  }

  try {
    const otpData = resetOtpStore.get(email);

    if (!otpData) {
      return res.status(400).json({
        message:
          "No OTP request found for this email. Please request OTP again.",
      });
    }

    if (Date.now() > otpData.expiresAt) {
      resetOtpStore.delete(email);
      return res.status(400).json({
        message: "OTP expired. Please request a new one.",
      });
    }

    const isOtpValid = await bcrypt.compare(String(otp), otpData.otpHash);

    if (!isOtpValid) {
      return res.status(400).json({
        message: "Invalid OTP. Please try again.",
      });
    }

    const [users] = await pool.query("SELECT id FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      resetOtpStore.delete(email);
      return res.status(404).json({
        message: "Email not registered. Please sign up first.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = ? WHERE email = ?", [
      hashedPassword,
      email,
    ]);

    resetOtpStore.delete(email);

    return res.json({
      message: "Password reset successful. You can now log in.",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({
      message: "Password reset failed",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  verifyEmail,
  resendVerificationCode,
  login,
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
};
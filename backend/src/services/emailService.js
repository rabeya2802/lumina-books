const nodemailer = require("nodemailer");

/**
 * Resolve an email config value, preferring EMAIL_* (new) and falling back
 * to SMTP_* (legacy) for backward compatibility.
 *
 *   env("HOST")     -> process.env.EMAIL_HOST || process.env.SMTP_HOST
 *   env("PASSWORD") -> process.env.EMAIL_PASSWORD || process.env.SMTP_PASS
 */
const env = (key) =>
  process.env[`EMAIL_${key}`] || process.env[`SMTP_${key}`];

let cachedTransporter = null;

/**
 * Create (and cache) a Nodemailer transporter from env vars.
 * Returns null if SMTP is not configured.
 */
const createTransporter = () => {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const host = env("HOST");
  const port = env("PORT");
  const user = env("USER");
  const pass = env("PASSWORD") || env("PASS");

  if (!host || !port || !user || !pass) {
    return null;
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
  });

  return cachedTransporter;
};

const getFromAddress = () => env("FROM") || env("USER");

/**
 * Send a transactional email. Returns true on success, false if SMTP
 * is not configured (so callers can fall back to a dev OTP).
 */
const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = createTransporter();

  if (!transporter) {
    return false;
  }

  await transporter.sendMail({
    from: getFromAddress(),
    to,
    subject,
    text,
    html,
  });

  return true;
};

/**
 * Email verification code sent at registration / login.
 */
const sendVerificationEmail = (email, code) =>
  sendEmail({
    to: email,
    subject: "Lumina Books - Verify your email",
    text: `Welcome to Lumina Books! Your email verification code is ${code}. It expires in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #d97706;">Welcome to Lumina Books!</h2>
        <p>Your email verification code is:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #ea580c;">${code}</p>
        <p>This code expires in 10 minutes.</p>
        <p style="color: #777; font-size: 12px;">If you didn't create an account, you can ignore this email.</p>
      </div>
    `,
  });

/**
 * Password reset OTP.
 */
const sendResetOtpEmail = (email, otp) =>
  sendEmail({
    to: email,
    subject: "Lumina Books Password Reset OTP",
    text: `Your Lumina Books OTP is ${otp}. It expires in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #d97706;">Lumina Books Password Reset</h2>
        <p>Your OTP is:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #ea580c;">${otp}</p>
        <p>This OTP expires in 10 minutes.</p>
      </div>
    `,
  });

module.exports = {
  createTransporter,
  sendEmail,
  sendVerificationEmail,
  sendResetOtpEmail,
};
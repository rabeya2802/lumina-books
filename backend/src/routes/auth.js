const express = require("express");
const {
  register,
  verifyEmail,
  resendVerificationCode,
  login,
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
} = require("../controllers/authController");

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user and send a verification code
 * @access  Public
 */
router.post("/register", register);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify the email verification code sent at registration
 * @access  Public
 */
router.post("/verify-email", verifyEmail);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend the email verification code
 * @access  Public
 */
router.post("/resend-verification", resendVerificationCode);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get JWT token
 * @access  Public
 */
router.post("/login", login);

/**
 * @route   POST /api/auth/forgot-password/request-otp
 * @desc    Send OTP for password reset
 * @access  Public
 */
router.post("/forgot-password/request-otp", requestPasswordResetOtp);

/**
 * @route   POST /api/auth/forgot-password/verify-otp
 * @desc    Verify OTP and reset password
 * @access  Public
 */
router.post("/forgot-password/verify-otp", verifyPasswordResetOtp);

module.exports = router;
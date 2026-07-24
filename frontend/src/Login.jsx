import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './services/api';

function Login({ onLoginStatusChange }) {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign Up
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }

        const response = await api.post('/api/auth/register', {
          name,
          email,
          password,
        });

        // Backend now requires email verification.
        if (response.data?.needsVerification) {
          setShowEmailVerification(true);
          setVerificationCode(response.data?.debugCode || '');
          setSuccess(
            response.data?.debugCode
              ? `Account created (dev). Verification code: ${response.data.debugCode}`
              : response.data?.message || 'A verification code was sent to your email.'
          );
        } else {
          setError('');
          setEmail('');
          setPassword('');
          setConfirmPassword('');
          setName('');
          setIsSignUp(false);
          alert('Account created! Please log in.');
        }
      } else {
        // Login
        const response = await api.post('/api/auth/login', {
          email,
          password,
        });

        // Save token and user data
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Notify parent that user is logged in
        if (onLoginStatusChange) {
          onLoginStatusChange();
        }
        
        // Redirect to home page after successful login
        navigate('/');
      }
    } catch (err) {
      const data = err.response?.data;

      // If login failed because the email isn't verified yet,
      // switch to the verification screen.
      if (data?.needsVerification) {
        setShowEmailVerification(true);
        setVerificationCode('');
        setError('');
        setSuccess(
          data?.message ||
            'Please verify your email. A verification code was sent to your email.'
        );
      } else {
        const message =
          data?.message || err.message || 'An error occurred. Please try again.';
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyEmailSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setVerifyLoading(true);

    try {
      const response = await api.post('/api/auth/verify-email', {
        email,
        code: verificationCode,
      });

      setSuccess(response.data?.message || 'Email verified! You can now log in.');
      setShowEmailVerification(false);
      setVerificationCode('');
      setIsSignUp(false);
      setPassword('');
      setConfirmPassword('');
      setName('');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Verification failed.';
      setError(message);
    } finally {
      setVerifyLoading(false);
    }
  }

  async function handleResendVerificationCode() {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await api.post(
        '/api/auth/resend-verification',
        { email }
      );

      const debugCode = response.data?.debugCode;
      setSuccess(
        debugCode
          ? `Verification code (dev): ${debugCode}`
          : response.data?.message || 'Verification code sent to your email.'
      );
      if (debugCode) {
        setVerificationCode(debugCode);
      }
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Could not resend code.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestOtpSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    setResetLoading(true);

    try {
      const response = await api.post('/api/auth/forgot-password/request-otp', {
        email: resetEmail,
      });

      const debugOtp = response.data?.debugOtp;
      setOtpRequested(true);
      setSuccess(
        debugOtp
          ? `OTP generated (dev): ${debugOtp}. Use it below to reset password.`
          : response.data?.message || 'OTP sent to your email.'
      );
      if (debugOtp) {
        setResetOtp(debugOtp);
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Could not request OTP. Please try again.';
      setError(message);
    } finally {
      setResetLoading(false);
    }
  }

  async function handleForgotPasswordSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setResetLoading(true);

    try {
      const response = await api.post('/api/auth/forgot-password/verify-otp', {
        email: resetEmail,
        otp: resetOtp,
        newPassword,
      });

      setSuccess(response.data?.message || 'Password reset successful. Please log in.');
      setShowForgotPassword(false);
      setOtpRequested(false);
      setIsSignUp(false);
      setEmail(resetEmail);
      setPassword('');
      setConfirmPassword('');
      setResetEmail('');
      setResetOtp('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Password reset failed. Please try again.';
      setError(message);
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-brand-gradient px-4">
      {/* Decorative blurs */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl"></div>
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl"></div>

      <div className="relative mx-auto flex w-full max-w-md flex-col justify-center py-12">
        <div className="animate-fade-up rounded-3xl bg-white p-8 shadow-2xl">
          {/* Logo */}
          <div className="mb-8 text-center">
            <span className="inline-grid h-14 w-14 place-items-center rounded-2xl bg-emerald-700 text-3xl text-white shadow-lg">
              📚
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold text-stone-900">
              Book<span className="text-emerald-700">Hub</span>
            </h2>
            <p className="mt-1 text-stone-500">Your online bookstore</p>
          </div>

          {!showForgotPassword && !showEmailVerification && (
            <>
              {/* Tabs */}
              <div className="mb-6 flex gap-2 rounded-full bg-stone-100 p-1">
                <button
                  onClick={() => {
                    setIsSignUp(false);
                    setError('');
                    setSuccess('');
                    setShowForgotPassword(false);
                    setOtpRequested(false);
                    setShowEmailVerification(false);
                  }}
                  className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${
                    !isSignUp
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setIsSignUp(true);
                    setError('');
                    setSuccess('');
                    setShowForgotPassword(false);
                    setOtpRequested(false);
                    setShowEmailVerification(false);
                  }}
                  className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${
                    isSignUp
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </>
          )}

          {/* Error / success messages */}
          {error && (
            <div className="mb-4 rounded-xl border-l-4 border-red-500 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-xl border-l-4 border-emerald-500 bg-emerald-50 p-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          {/* Email Verification Screen */}
          {showEmailVerification ? (
            <form onSubmit={handleVerifyEmailSubmit} className="space-y-4">
              <div>
                <p className="mb-1 text-sm text-stone-600">Verifying email</p>
                <p className="break-all font-semibold text-emerald-700">{email}</p>
                <p className="mt-1 text-xs text-stone-500">
                  Enter the 6-digit code we sent to this email.
                </p>
              </div>

              <input
                type="text"
                placeholder="Enter 6-digit verification code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-center text-lg tracking-[0.5em] outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
              />

              <button
                type="submit"
                disabled={verifyLoading}
                className="w-full rounded-xl bg-emerald-700 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {verifyLoading ? 'Verifying...' : 'Verify Email'}
              </button>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailVerification(false);
                    setError('');
                    setSuccess('');
                    setVerificationCode('');
                  }}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
                >
                  Back to Login/Signup
                </button>
                <button
                  type="button"
                  onClick={handleResendVerificationCode}
                  disabled={loading}
                  className="text-xs font-semibold text-stone-600 hover:text-stone-900 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Resend code'}
                </button>
              </div>
            </form>
          ) : !showForgotPassword && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                />
              )}

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
              />

              {!isSignUp && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setError('');
                      setSuccess('');
                      setResetEmail(email);
                      setOtpRequested(false);
                      setResetOtp('');
                      setNewPassword('');
                      setConfirmNewPassword('');
                    }}
                    className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {isSignUp && (
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                />
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-emerald-700 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? '...' : isSignUp ? 'Create Account' : 'Login'}
              </button>
            </form>
          )}

          {showForgotPassword && (
            <div className="mt-4 space-y-3 rounded-xl bg-stone-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-stone-800">Reset your password with OTP</p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setError('');
                    setSuccess('');
                  }}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
                >
                  Back to Login/Signup
                </button>
              </div>

              <form onSubmit={handleRequestOtpSubmit} className="space-y-3">
                <input
                  type="email"
                  placeholder="Your registered email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                />

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full rounded-xl bg-stone-800 py-3 font-semibold text-white transition hover:bg-stone-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {resetLoading ? 'Sending OTP...' : otpRequested ? 'Resend OTP' : 'Send OTP'}
                </button>
              </form>

              {otpRequested && (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                    required
                    className="w-full rounded-xl border border-stone-300 px-4 py-3 text-center tracking-[0.3em] outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                  />

                  <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                  />

                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                  />

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full rounded-xl bg-emerald-700 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {resetLoading ? 'Resetting...' : 'Verify OTP & Reset Password'}
                  </button>
                </form>
              )}
            </div>
          )}

          
        </div>
      </div>
    </div>
  );
}

export default Login;
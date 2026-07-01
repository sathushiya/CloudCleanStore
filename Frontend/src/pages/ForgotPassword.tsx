import { useState } from 'react';
import { Mail, Lock, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import Logo from '../components/common/Logo';
import BackButton from '../components/common/BackButton';
import authService from '../services/authService';

interface ForgotPasswordProps {
  onBack: () => void;
  onNavigateToLogin: () => void;
}

type Step = 'email' | 'otp' | 'newPassword' | 'success';

export default function ForgotPassword({ onBack, onNavigateToLogin }: ForgotPasswordProps) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.forgotPassword(email);
      if (result.success) {
        setStep('otp');
      } else {
        setError(result.message || 'Failed to send OTP');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d+$/.test(value)) return;

    const newOTP = [...otp];
    newOTP[index] = value;
    setOtp(newOTP);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const enteredOTP = otp.join('');
    if (enteredOTP.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.verifyPasswordResetOtp(email, enteredOTP);
      if (result.success) {
        setResetToken(result.data.reset_token);
        setStep('newPassword');
      } else {
        setError(result.message || 'Invalid OTP');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.resetPassword(
        email,
        resetToken,
        newPassword,
        confirmPassword
      );
      if (result.success) {
        setStep('success');
        setTimeout(() => {
          onNavigateToLogin();
        }, 2000);
      } else {
        setError(result.message || 'Password reset failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Password reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtp(['', '', '', '', '', '']);
    setError('');
    try {
      await authService.resendOtp(email, 'password_reset');
    } catch (err: any) {
      setError('Failed to resend code. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-[#0f0a1e] dark:via-[#1a1425] dark:to-[#2d1b4e] px-4 py-12">
      {/* Background effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[128px] opacity-20 dark:opacity-30" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[128px] opacity-20 dark:opacity-30" />

      <div className="relative w-full max-w-md">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton onBack={onBack} />
        </div>

        {/* Card */}
        <div className="backdrop-blur-xl bg-white/70 dark:bg-white/5 rounded-3xl p-8 border border-white/20 dark:border-purple-700/30 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo variant="icon" />
          </div>

          {/* Step 1: Email */}
          {step === 'email' && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Forgot Password?</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Enter your email to receive a verification code
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              <form onSubmit={handleEmailSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none transition-colors"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-2xl font-medium hover:shadow-[var(--glow-purple-strong)] transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </button>
              </form>
            </>
          )}

          {/* Step 2: OTP Verification */}
          {step === 'otp' && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Enter Verification Code</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  We sent a 6-digit code to {email}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              <form onSubmit={handleOTPSubmit} className="space-y-5">
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      className="w-12 h-14 text-center text-xl font-bold rounded-2xl bg-white dark:bg-white/5 border-2 border-gray-200 dark:border-purple-700/20 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none transition-colors"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-2xl font-medium hover:shadow-[var(--glow-purple-strong)] transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    Resend Code
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Step 3: New Password */}
          {step === 'newPassword' && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Create New Password</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Enter your new password
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              <form onSubmit={handlePasswordReset} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none transition-colors"
                      placeholder="Enter new password"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none transition-colors"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-2xl font-medium hover:shadow-[var(--glow-purple-strong)] transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Password Reset!</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Your password has been successfully reset
              </p>
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-4">
                Redirecting to login...
              </p>
            </div>
          )}

          {/* Back to Login */}
          {step !== 'success' && (
            <div className="mt-6 text-center">
              <button
                onClick={onNavigateToLogin}
                className="text-sm text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 justify-center mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
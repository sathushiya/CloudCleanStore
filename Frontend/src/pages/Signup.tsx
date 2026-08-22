import { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, CheckCircle, X, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validateEmail, validatePassword } from '../utils/auth';
import Logo from '../components/common/Logo';
import BackButton from '../components/common/BackButton';
import authService from '../services/authService';
import phoneService from '../services/phoneService';

interface SignupProps {
  onNavigateToLogin: () => void;
  onSignupSuccess: () => void;
  onBack: () => void;
}

export default function Signup({ onNavigateToLogin, onSignupSuccess, onBack }: SignupProps) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [step, setStep] = useState<'form' | 'verify-otp' | 'verify-phone'>('form');
  const [pendingEmail, setPendingEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  const [hasWhatsapp, setHasWhatsapp] = useState<boolean | null>(null);
  const [checkingWhatsapp, setCheckingWhatsapp] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState(['', '', '', '', '', '']);
  const [phoneOtpError, setPhoneOtpError] = useState('');
  const [phoneOtpLoading, setPhoneOtpLoading] = useState(false);
  const [sendingPhoneOtp, setSendingPhoneOtp] = useState(false);

  const passwordValidation = validatePassword(formData.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');

    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setOtpError('Please enter the 6-digit OTP');
      return;
    }

    setOtpLoading(true);

    try {
      const result = await authService.verifyEmail(pendingEmail, otpValue);
      if (result.success) {
        login(result.data.user);
        setStep('verify-phone');
      } else {
        setOtpError(result.message || 'Verification failed');
      }
    } catch (err: any) {
      setOtpError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1 || (value && !/^\d+$/.test(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`signup-otp-${index + 1}`)?.focus();
    }
  };

  const handleResendOtp = async () => {
    await authService.resendOtp(pendingEmail, 'email_verification');
  };

  const handleCheckWhatsapp = async () => {
    setCheckingWhatsapp(true);
    setPhoneOtpError('');
    try {
      const result = await phoneService.checkWhatsapp(formData.phone);
      setHasWhatsapp(result.has_whatsapp);
    } catch (err: any) {
      setPhoneOtpError(err.response?.data?.message || 'Could not validate this phone number.');
    } finally {
      setCheckingWhatsapp(false);
    }
  };

  // Verification is WhatsApp-only, so check as soon as this step loads
  // rather than waiting for the user to click a separate button.
  useEffect(() => {
    if (step === 'verify-phone') {
      handleCheckWhatsapp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const handleSendPhoneOtp = async () => {
    setSendingPhoneOtp(true);
    setPhoneOtpError('');
    try {
      await phoneService.sendOtp(formData.phone);
      setPhoneOtpSent(true);
    } catch (err: any) {
      setPhoneOtpError(err.response?.data?.message || 'Failed to send verification code.');
    } finally {
      setSendingPhoneOtp(false);
    }
  };

  const handlePhoneOtpChange = (index: number, value: string) => {
    if (value.length > 1 || (value && !/^\d+$/.test(value))) return;
    const newOtp = [...phoneOtp];
    newOtp[index] = value;
    setPhoneOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`signup-phone-otp-${index + 1}`)?.focus();
    }
  };

  const handlePhoneOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneOtpError('');

    const otpValue = phoneOtp.join('');
    if (otpValue.length !== 6) {
      setPhoneOtpError('Please enter the 6-digit code');
      return;
    }

    setPhoneOtpLoading(true);
    try {
      const result = await phoneService.verifyOtp(formData.phone, otpValue);
      setHasWhatsapp(result.has_whatsapp);
      onSignupSuccess();
    } catch (err: any) {
      setPhoneOtpError(err.response?.data?.message || 'Invalid code. Please try again.');
    } finally {
      setPhoneOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!formData.phone.trim() || !/^\+[1-9]\d{6,14}$/.test(formData.phone.replace(/[\s\-()]/g, ''))) {
      setError('Please enter a valid phone number with country code (e.g. +94771234567) -- this is needed for WhatsApp verification');
      return;
    }

    if (!passwordValidation.isValid) {
      setError('Please fix password validation errors');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const result = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        phone_number: formData.phone,
      });

      if (result.success) {
        setPendingEmail(formData.email);
        setStep('verify-otp');
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      if (errors) {
        const firstError = Object.values(errors)[0] as string[];
        setError(firstError[0]);
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    switch (passwordValidation.strength) {
      case 'strong':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      default:
        return 'bg-red-500';
    }
  };

  const getStrengthWidth = () => {
    switch (passwordValidation.strength) {
      case 'strong':
        return 'w-full';
      case 'medium':
        return 'w-2/3';
      default:
        return 'w-1/3';
    }
  };

  if (step === 'verify-otp') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-50 via-white to-purple-100 dark:from-[#0f0a1e] dark:via-[#1a1425] dark:to-[#2d1b4e] px-4 py-12">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[128px] opacity-20 dark:opacity-30" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[128px] opacity-20 dark:opacity-30" />

        <div className="relative w-full max-w-md">
          <div className="backdrop-blur-xl bg-white/70 dark:bg-white/5 rounded-3xl p-8 border border-white/20 dark:border-purple-700/30 shadow-2xl">
            <div className="flex justify-center mb-8">
              <Logo variant="icon" />
            </div>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Verify Your Email</h1>
              <p className="text-gray-600 dark:text-gray-400">
                We sent a 6-digit code to <strong>{pendingEmail}</strong>
              </p>
            </div>

            {otpError && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">{otpError}</p>
              </div>
            )}

            <form onSubmit={handleOtpVerify}>
              <div className="flex gap-2 justify-center mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`signup-otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !digit && index > 0) {
                        document.getElementById(`signup-otp-${index - 1}`)?.focus();
                      }
                    }}
                    className="w-12 h-12 text-center text-xl font-bold border-2 border-purple-200 dark:border-purple-700/50 rounded-xl bg-white/50 dark:bg-white/5 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={otpLoading}
                className="w-full py-3.5 px-6 bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {otpLoading ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>

            <p className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
              Didn't receive the code?{' '}
              <button
                onClick={handleResendOtp}
                className="text-purple-600 dark:text-purple-400 font-medium hover:underline"
              >
                Resend OTP
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'verify-phone') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-50 via-white to-purple-100 dark:from-[#0f0a1e] dark:via-[#1a1425] dark:to-[#2d1b4e] px-4 py-12">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[128px] opacity-20 dark:opacity-30" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[128px] opacity-20 dark:opacity-30" />

        <div className="relative w-full max-w-md">
          <div className="backdrop-blur-xl bg-white/70 dark:bg-white/5 rounded-3xl p-8 border border-white/20 dark:border-purple-700/30 shadow-2xl">
            <div className="flex justify-center mb-8">
              <Logo variant="icon" />
            </div>

            <div className="text-center mb-8">
              <MessageCircle className="w-10 h-10 mx-auto mb-3 text-purple-600 dark:text-purple-400" />
              <h1 className="text-3xl font-bold mb-2">Verify via WhatsApp</h1>
              <p className="text-gray-600 dark:text-gray-400">
                One last step -- we'll send a code to <strong>{formData.phone}</strong> on WhatsApp to finish creating your account
              </p>
            </div>

            {phoneOtpError && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">{phoneOtpError}</p>
              </div>
            )}

            {!phoneOtpSent ? (
              <div className="space-y-4">
                {checkingWhatsapp && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Checking WhatsApp availability...</p>
                )}

                {!checkingWhatsapp && hasWhatsapp === false && (
                  <div className="space-y-3">
                    <p className="text-sm text-red-600 dark:text-red-400 text-center flex items-center justify-center gap-1">
                      <AlertCircle className="w-4 h-4 shrink-0" /> This number doesn't have WhatsApp. We can only verify over WhatsApp.
                    </p>
                    <button
                      onClick={() => setStep('form')}
                      className="w-full py-3 px-6 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 rounded-2xl font-medium text-gray-700 dark:text-gray-300"
                    >
                      Use a different number
                    </button>
                  </div>
                )}

                {!checkingWhatsapp && hasWhatsapp !== false && (
                  <>
                    {hasWhatsapp === true && (
                      <p className="text-sm text-green-600 dark:text-green-400 text-center flex items-center justify-center gap-1">
                        <CheckCircle className="w-4 h-4" /> This number has WhatsApp
                      </p>
                    )}
                    <button
                      onClick={handleSendPhoneOtp}
                      disabled={sendingPhoneOtp}
                      className="w-full py-3.5 px-6 bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingPhoneOtp ? 'Sending...' : 'Send Verification Code'}
                    </button>
                  </>
                )}
              </div>
            ) : (
              <form onSubmit={handlePhoneOtpVerify}>
                <div className="flex gap-2 justify-center mb-6">
                  {phoneOtp.map((digit, index) => (
                    <input
                      key={index}
                      id={`signup-phone-otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePhoneOtpChange(index, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !digit && index > 0) {
                          document.getElementById(`signup-phone-otp-${index - 1}`)?.focus();
                        }
                      }}
                      className="w-12 h-12 text-center text-xl font-bold border-2 border-purple-200 dark:border-purple-700/50 rounded-xl bg-white/50 dark:bg-white/5 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={phoneOtpLoading}
                  className="w-full py-3.5 px-6 bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {phoneOtpLoading ? 'Verifying...' : 'Verify & Finish'}
                </button>

                <p className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
                  Didn't receive the code?{' '}
                  <button
                    type="button"
                    onClick={handleSendPhoneOtp}
                    className="text-purple-600 dark:text-purple-400 font-medium hover:underline"
                  >
                    Resend
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-50 via-white to-purple-100 dark:from-[#0f0a1e] dark:via-[#1a1425] dark:to-[#2d1b4e] px-4 py-12">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[128px] opacity-20 dark:opacity-30" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[128px] opacity-20 dark:opacity-30" />

      <div className="relative w-full max-w-md">
        <div className="mb-4">
          <BackButton onBack={onBack} />
        </div>

        <div className="backdrop-blur-xl bg-white/70 dark:bg-white/5 rounded-3xl p-8 border border-white/20 dark:border-purple-700/30 shadow-2xl">
          <div className="flex justify-center mb-8">
            <Logo variant="icon" />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Create Account</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Join Cloud Clean Store today
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone Number (WhatsApp Number)</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="+94771234567"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Include your country code. You'll verify this number via WhatsApp after signup.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setPasswordFocused(true)}
                  className="w-full pl-12 pr-12 py-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="Create a strong password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Password Strength:
                    </span>
                    <span className={`text-xs font-medium ${
                      passwordValidation.strength === 'strong'
                        ? 'text-green-600 dark:text-green-400'
                        : passwordValidation.strength === 'medium'
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {passwordValidation.strength.toUpperCase()}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getStrengthColor()} ${getStrengthWidth()} transition-all duration-300`}
                    />
                  </div>
                </div>
              )}

              {(passwordFocused || formData.password) && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl space-y-2">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password must contain:
                  </p>
                  {passwordValidation.isValid ? (
                    <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span>All requirements met!</span>
                    </div>
                  ) : (
                    passwordValidation.errors.map((error, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <X className="w-4 h-4 text-red-500" />
                        <span>{error}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <X className="w-3 h-3" />
                  Passwords do not match
                </p>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <p className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Passwords match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !passwordValidation.isValid}
              className="w-full py-3 bg-linear-to-r from-purple-600 to-purple-700 text-white rounded-2xl font-medium hover:shadow-(--glow-purple-strong) transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <button
                onClick={onNavigateToLogin}
                className="text-purple-600 dark:text-purple-400 font-medium hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
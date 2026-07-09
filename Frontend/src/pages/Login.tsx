import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { authenticateUser, validateEmail } from "../utils/auth";
import Logo from "../components/common/Logo";
import BackButton from "../components/common/BackButton";
import authService from "../services/authService";

interface LoginProps {
  onNavigateToSignup: () => void;
  onLoginSuccess: () => void;
  onBack: () => void;
  onNavigateToForgotPassword?: () => void;
}

export default function Login({
  onNavigateToSignup,
  onLoginSuccess,
  onBack,
  onNavigateToForgotPassword,
}: LoginProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!password) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);

    try {
      const result = await authService.login({
        email,
        password,
        remember_me: rememberMe, // ← add rememberMe state (see section 8)
      });

      if (result.success) {
        login(result.data.user);
        onLoginSuccess();
      } else {
        setError(result.message || "Login failed");
      }
    } catch (err: any) {
      const apiError =
        err.response?.data?.message || "Invalid email or password";
      setError(apiError);
    } finally {
      setLoading(false);
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

        {/* Login Card */}
        <div className="backdrop-blur-xl bg-white/70 dark:bg-white/5 rounded-3xl p-8 border border-white/20 dark:border-purple-700/30 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo variant="icon" />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in to your account
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-200 dark:border-purple-700/30">
            <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-2">
              Demo Credentials:
            </p>
            <div className="text-xs space-y-1 text-gray-700 dark:text-gray-300">
              <p>
                <strong>Admin:</strong> admin@cloudclean.store /
                Admin@2026!Secure
              </p>
              <p>
                <strong>Staff Supervisor:</strong> supervisor@cloudclean.store /
                Supervisor@2026!Lead
              </p>
              <p>
                <strong>Staff:</strong> staff@cloudclean.store /
                Staff@2026!Strong
              </p>
              <p>
                <strong>Customer:</strong> customer@cloudclean.store /
                Customer@2026!Pass
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Email Address
              </label>
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

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me + Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 dark:border-purple-700/40 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Remember me
                </span>
              </label>

              <button
                type="button"
                onClick={onNavigateToForgotPassword}
                className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-2xl font-medium hover:shadow-[var(--glow-purple-strong)] transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <button
                onClick={onNavigateToSignup}
                className="text-purple-600 dark:text-purple-400 font-medium hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

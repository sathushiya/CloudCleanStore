import { useState } from 'react';
import { Bell, Mail, MessageSquare, Moon, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import BackButton from '../components/common/BackButton';

interface CustomerSettingsProps {
  onBack: () => void;
}

export default function CustomerSettings({ onBack }: CustomerSettingsProps) {
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    smsAlerts: false,
    darkMode: false
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!currentPassword) {
      setPasswordError('Please enter your current password');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    }, 1000);
  };

  const settingsConfig = [
    { key: 'notifications' as const, label: 'Push Notifications', description: 'Receive push notifications', icon: Bell },
    { key: 'emailUpdates' as const, label: 'Email Updates', description: 'Get email updates about orders', icon: Mail },
    { key: 'smsAlerts' as const, label: 'SMS Alerts', description: 'Receive SMS for important updates', icon: MessageSquare },
    { key: 'darkMode' as const, label: 'Dark Mode', description: 'Enable dark theme', icon: Moon }
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-purple-100 dark:from-[#0f0a1e] dark:via-[#1a1425] dark:to-[#2d1b4e] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton onBack={onBack} />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your preferences</p>
        </div>

        {/* Change Password Section */}
        <div className="mb-8 backdrop-blur-xl bg-white/70 dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-100 dark:bg-purple-900/30">
              <Lock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Change Password</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Update your account password</p>
            </div>
          </div>

          {passwordError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{passwordError}</p>
            </div>
          )}

          {passwordSuccess && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/30 rounded-2xl flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <p className="text-sm text-green-700 dark:text-green-300">Password changed successfully!</p>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium mb-2">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-2">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-linear-to-r from-purple-600 to-purple-700 text-white rounded-2xl font-medium hover:shadow-(--glow-purple-strong) transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Settings List */}
        <div className="space-y-4">
          {settingsConfig.map((setting) => {
            const Icon = setting.icon;
            const isEnabled = settings[setting.key];

            return (
              <div
                key={setting.key}
                onClick={() => toggleSetting(setting.key)}
                className="backdrop-blur-xl bg-white/70 dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20 hover:border-purple-300 dark:hover:border-purple-600/50 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isEnabled ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                      <Icon className={`w-6 h-6 ${isEnabled ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{setting.label}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{setting.description}</p>
                    </div>
                  </div>
                  <div className={`w-14 h-7 rounded-full transition-colors ${isEnabled ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-700'}`}>
                    <div className={`w-6 h-6 bg-white rounded-full mt-0.5 transition-transform ${isEnabled ? 'ml-7' : 'ml-0.5'}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

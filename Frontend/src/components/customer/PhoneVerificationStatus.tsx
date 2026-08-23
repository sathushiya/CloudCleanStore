import { useEffect, useState } from 'react';
import { MessageCircle, CheckCircle, AlertCircle } from 'lucide-react';
import profileService from '../../services/profileService';
import phoneService from '../../services/phoneService';

export default function PhoneVerificationStatus() {
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [verifiedAt, setVerifiedAt] = useState<string | null>(null);
  const [hasWhatsapp, setHasWhatsapp] = useState<boolean | null>(null);

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  const loadStatus = async () => {
    setLoading(true);
    try {
      const profile = await profileService.get();
      setPhoneNumber(profile.phone_number ?? null);
      setVerifiedAt(profile.phone_verified_at ?? null);
      setHasWhatsapp(profile.has_whatsapp ?? null);
    } catch {
      // leave blank on failure
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleSendOtp = async () => {
    if (!phoneNumber) return;
    setSending(true);
    setError('');
    try {
      await phoneService.sendOtp(phoneNumber);
      setOtpSent(true);
      // A fresh code invalidates whatever was typed for the last one --
      // clear it so a stale code can't be resubmitted by mistake.
      setOtp('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send verification code.');
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    if (!phoneNumber || otp.length !== 6) return;
    setVerifying(true);
    setError('');
    try {
      await phoneService.verifyOtp(phoneNumber, otp);
      setOtpSent(false);
      setOtp('');
      await loadStatus();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid code. Please try again.');
      setOtp('');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading phone status...</div>;
  }

  if (!phoneNumber) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        No phone number on file yet.
      </div>
    );
  }

  const isVerified = !!verifiedAt;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{phoneNumber}</div>
          {isVerified ? (
            <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4" /> Verified
              {hasWhatsapp === true && (
                <span className="ml-2 flex items-center gap-1 text-purple-600 dark:text-purple-400">
                  <MessageCircle className="w-4 h-4" /> WhatsApp available
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1 text-sm text-orange-600 dark:text-orange-400">
              <AlertCircle className="w-4 h-4" /> Not verified
            </div>
          )}
        </div>

        {!isVerified && !otpSent && (
          <button
            onClick={handleSendOtp}
            disabled={sending}
            className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium disabled:opacity-50"
          >
            {sending ? 'Sending via WhatsApp...' : 'Verify via WhatsApp'}
          </button>
        )}
      </div>

      {!isVerified && !otpSent && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          We'll send a code to this number on WhatsApp -- it needs to be WhatsApp-enabled.
        </p>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {otpSent && (
        <div className="flex gap-2">
          <input
            type="text"
            maxLength={6}
            placeholder="6-digit WhatsApp code"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-purple-700/20 bg-white dark:bg-white/5 text-gray-900 dark:text-white"
          />
          <button
            onClick={handleVerify}
            disabled={verifying || otp.length !== 6}
            className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium disabled:opacity-50"
          >
            {verifying ? 'Verifying...' : 'Confirm'}
          </button>
        </div>
      )}
    </div>
  );
}
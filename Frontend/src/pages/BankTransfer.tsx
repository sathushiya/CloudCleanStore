import { Copy, Check, Building2, ArrowLeft, Clock, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';

interface OrderDetails {
  customerName: string;
  address: string;
  products: { name: string; quantity: number }[];
  deliveryTime: 'express' | 'standard';
}

interface BankTransferProps {
  total: number;
  orderId: string; // real numeric order ID (as a string) -- see note below if this is actually the order_number
  orderDetails: OrderDetails;
  onBack: () => void;
  onConfirm: () => void;
}

export default function BankTransfer({ total, orderId, orderDetails, onBack, onConfirm }: BankTransferProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const bankDetails = {
    bank: 'Bank of Ceylon (BOC)',
    accountName: 'Cloud Clean Store (Pvt) Ltd',
    accountNumber: '8001234567890',
    branch: 'Colombo Main Branch',
    swiftCode: 'BCEYLKLX',
  };

  const numericOrderId = Number(orderId);

  useEffect(() => {
    if (!waiting) return;
    const interval = setInterval(async () => {
      try {
        const order = await orderService.myOrder(numericOrderId);
        if (order.payment_status === 'confirmed') {
          setConfirmed(true);
          clearInterval(interval);
          setTimeout(() => onConfirm(), 2500);
        }
      } catch {
        // Transient network error -- just try again on the next tick
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [waiting, numericOrderId, onConfirm]);

  const handleTransferDone = async () => {
    setSubmitError('');
    setSubmitting(true);
    try {
      await orderService.submitPayment(numericOrderId, orderId);
      setWaiting(true);
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to submit payment confirmation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (value: string, field: string) => {
    navigator.clipboard.writeText(value);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const CopyButton = ({ value, field }: { value: string; field: string }) => (
    <button
      onClick={() => copyToClipboard(value, field)}
      className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all"
    >
      {copied === field ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  );

  if (confirmed) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-purple-100 dark:from-[#0f0a1e] dark:via-[#1a1425] dark:to-[#2d1b4e] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your payment has been verified and your order is confirmed.
          </p>
        </div>
      </div>
    );
  }

  if (waiting) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-purple-100 dark:from-[#0f0a1e] dark:via-[#1a1425] dark:to-[#2d1b4e] flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-12 h-12 text-purple-600 dark:text-purple-400 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Please Wait for Admin's Confirmation</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
            Our team is verifying your payment. This usually takes a few minutes. You will be notified once confirmed.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-purple-100 dark:from-[#0f0a1e] dark:via-[#1a1425] dark:to-[#2d1b4e] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Online Banking Transfer</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Transfer your payment to this bank account
          </p>
        </div>

        <div className="bg-white dark:bg-white/5 rounded-3xl border border-gray-200 dark:border-purple-700/20 p-5 mb-4">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            Order Summary
          </div>
          <div className="space-y-1 mb-3">
            <div className="font-medium">{orderDetails.customerName}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{orderDetails.address}</div>
          </div>
          <ul className="space-y-1 mb-3">
            {orderDetails.products.map((p, i) => (
              <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex justify-between">
                <span>{p.name}</span>
                <span>× {p.quantity}</span>
              </li>
            ))}
          </ul>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {orderDetails.deliveryTime === 'express' ? 'Express delivery' : 'Standard delivery'}
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 rounded-3xl border border-gray-200 dark:border-purple-700/20 overflow-hidden mb-4">
          <div className="bg-linear-to-r from-purple-600 to-purple-800 p-5 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-bold">{bankDetails.bank}</div>
              <div className="text-purple-200 text-sm">{bankDetails.branch}</div>
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-purple-700/20">
            {[
              { label: 'Account Name', value: bankDetails.accountName, field: 'name' },
              { label: 'Account Number', value: bankDetails.accountNumber, field: 'number', highlight: true },
              { label: 'SWIFT Code', value: bankDetails.swiftCode, field: 'swift' },
            ].map(({ label, value, field, highlight }) => (
              <div key={field} className="flex items-center justify-between px-5 py-4">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</div>
                  <div className={`font-semibold ${highlight ? 'text-purple-600 dark:text-purple-400 text-lg tracking-widest' : ''}`}>
                    {value}
                  </div>
                </div>
                <CopyButton value={value} field={field} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700/30 rounded-2xl p-4 mb-4 flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400 font-medium">Amount to Transfer</span>
          <span className="text-xl font-bold text-purple-600 dark:text-purple-400">LKR {total.toFixed(2)}</span>
        </div>

        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-3">
          Please use your Order ID as the payment reference. Your order will be confirmed once the payment is verified.
        </p>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/30 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center shrink-0 mt-0.5">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-green-600 dark:fill-green-400">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
          <p className="text-sm text-green-800 dark:text-green-300">
            For verification purposes, you will receive a message on your WhatsApp. Please send the payment receipt to that number.
          </p>
        </div>

        {submitError && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30 rounded-2xl text-sm text-red-700 dark:text-red-300">
            {submitError}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-gray-200 dark:border-purple-700/30 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={handleTransferDone}
            disabled={submitting}
            className="flex-1 py-3 bg-linear-to-r from-purple-600 to-purple-700 text-white rounded-2xl font-semibold hover:shadow-(--glow-purple-strong) transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            {submitting ? 'Submitting...' : "I've Completed the Transfer"}
          </button>
        </div>
      </div>
    </div>
  );
}
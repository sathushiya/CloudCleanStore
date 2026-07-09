import { useState, useEffect } from 'react';
import BankTransfer from './BankTransfer';
import {
  MapPin,
  CreditCard,
  Wallet,
  Building2,
  Check,
  Clock,
  Package,
  ChevronRight,
  Plus,
  X,
  Edit2,
  Trash2,
  MessageSquare
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { cartService } from '../services/cartService';
import { orderService } from '../services/orderService';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import BackButton from '../components/common/BackButton';

interface CheckoutProps {
  onBack: () => void;
  onOrderPlaced: () => void;
}

type PaymentMethod = 'cash' | 'banking';

interface Address {
  id: number;
  type: string;
  name: string;
  address: string;
  city: string;
  message?: string;
  isCustom?: boolean;
}

export default function Checkout({ onBack, onOrderPlaced }: CheckoutProps) {
  const { items, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [selectedAddress, setSelectedAddress] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('banking');
  const [deliveryTime, setDeliveryTime] = useState<'express' | 'standard'>('express');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showBankTransfer, setShowBankTransfer] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const subtotal = getCartTotal();
  const deliveryFee = subtotal * 0.08;
  const total = subtotal + deliveryFee;

  // Load addresses from localStorage
  const [addresses, setAddresses] = useState<Address[]>(() => {
    const saved = localStorage.getItem('customerAddresses');
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      {
        id: 1,
        type: 'Home',
        name: user?.name || 'John Doe',
        address: '123 Main Street, Apt 4B',
        city: 'New York, NY 10001',
        message: '',
        isCustom: false
      },
      {
        id: 2,
        type: 'Office',
        name: user?.name || 'John Doe',
        address: '456 Business Ave, Suite 200',
        city: 'New York, NY 10002',
        message: '',
        isCustom: false
      }
    ];
  });

  // Save addresses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('customerAddresses', JSON.stringify(addresses));
  }, [addresses]);

  const handleAddAddress = (newAddress: Omit<Address, 'id'>) => {
    const id = Math.max(...addresses.map(a => a.id), 0) + 1;
    setAddresses([...addresses, { ...newAddress, id }]);
    setShowAddressModal(false);
  };

  const handleEditAddress = (updatedAddress: Address) => {
    setAddresses(addresses.map(a => a.id === updatedAddress.id ? updatedAddress : a));
    setShowAddressModal(false);
    setEditingAddress(null);
  };

  const handleDeleteAddress = (id: number) => {
    if (confirm('Are you sure you want to delete this address?')) {
      setAddresses(addresses.filter(a => a.id !== id));
      if (selectedAddress === id) {
        setSelectedAddress(addresses[0]?.id || 1);
      }
    }
  };

  // Pushes the local cart into the backend cart, then checks out — this is what
  // actually creates a real Order row (previously this was purely simulated).
  const submitOrder = async () => {
    setIsSubmittingOrder(true);
    setOrderError(null);
    try {
      for (const item of items) {
        await cartService.add(Number(item.variant.id), item.quantity);
      }

      const selectedAddr = addresses.find(a => a.id === selectedAddress) || addresses[0];
      const deliveryAddress = selectedAddr
        ? `${selectedAddr.address}, ${selectedAddr.city}`
        : 'Address not provided';

      await orderService.checkout(deliveryAddress);

      clearCart();
      setShowSuccess(true);
      setTimeout(() => {
        onOrderPlaced();
      }, 3000);
    } catch (err) {
      setOrderError('We could not place your order. Please check your connection and try again.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handlePlaceOrder = () => {
    if (paymentMethod === 'banking') {
      setShowBankTransfer(true);
      return;
    }
    submitOrder();
  };

  if (showBankTransfer) {
    const orderId = `ORD-${Date.now()}`;
    const selectedAddr = addresses.find(a => a.id === selectedAddress) || addresses[0];
    return (
      <BankTransfer
        total={total}
        orderId={orderId}
        orderDetails={{
          customerName: user?.name || selectedAddr?.name || 'Customer',
          address: selectedAddr ? `${selectedAddr.address}, ${selectedAddr.city}` : 'N/A',
          products: items.map(i => ({ name: i.product.name, quantity: i.quantity })),
          deliveryTime,
        }}
        onBack={() => setShowBankTransfer(false)}
        onConfirm={submitOrder}
      />
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-[#0f0a1e] dark:via-[#1a1425] dark:to-[#2d1b4e] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <Check className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Order Placed!</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your order will be delivered soon
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
            <Clock className="w-4 h-4" />
            Estimated delivery: {deliveryTime === 'express' ? '30' : '60'} minutes
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0a1e]">
      {/* Header */}
      <div className="bg-white dark:bg-[#1a1425] border-b border-gray-200 dark:border-purple-700/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <BackButton onBack={onBack} />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Checkout</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {items.length} item{items.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Checkout Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-xl font-bold">Delivery Address</h2>
              </div>

              <div className="space-y-3">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`relative p-4 rounded-2xl border-2 transition-all ${
                      selectedAddress === address.id
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <button
                      onClick={() => setSelectedAddress(address.id)}
                      className="w-full text-left"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{address.type}</span>
                            {selectedAddress === address.id && (
                              <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{address.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{address.address}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{address.city}</p>
                          {address.message && (
                            <div className="mt-2 flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-blue-700 dark:text-blue-300">{address.message}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>

                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingAddress(address);
                          setShowAddressModal(true);
                        }}
                        className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                        title="Edit address"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {address.isCustom && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAddress(address.id);
                          }}
                          className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                          title="Delete address"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add New Address Button */}
                <button
                  onClick={() => {
                    setEditingAddress(null);
                    setShowAddressModal(true);
                  }}
                  className="w-full p-4 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-purple-600 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="font-semibold text-purple-600 dark:text-purple-400">Add New Address</span>
                </button>
              </div>
            </div>

            {/* Delivery Time */}
            <div className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-xl font-bold">Delivery Time</h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setDeliveryTime('express')}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    deliveryTime === 'express'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Express</span>
                    {deliveryTime === 'express' && (
                      <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">20-30 minutes</p>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mt-1">
                    {subtotal > 50 ? 'FREE' : 'LKR 5.99'}
                  </p>
                </button>

                <button
                  onClick={() => setDeliveryTime('standard')}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    deliveryTime === 'standard'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Standard</span>
                    {deliveryTime === 'standard' && (
                      <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">45-60 minutes</p>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mt-1">
                    {subtotal > 50 ? 'FREE' : 'LKR 2.99'}
                  </p>
                </button>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-xl font-bold">Payment Method</h2>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setPaymentMethod('banking')}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                    paymentMethod === 'banking'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Wallet className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      <div>
                        <div className="font-semibold">Online Banking</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Pay via internet banking</div>
                      </div>
                    </div>
                    {paymentMethod === 'banking' && (
                      <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                    paymentMethod === 'cash'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      <div>
                        <div className="font-semibold">Cash on Delivery</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Pay when you receive</div>
                      </div>
                    </div>
                    {paymentMethod === 'cash' && (
                      <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-xl font-bold">Order Summary</h2>
              </div>

              {/* Items */}
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.variant.id}`} className="flex gap-3">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                      <ImageWithFallback
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold truncate">{item.product.name}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {item.variant.size} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-sm font-semibold">
                      LKR {(item.variant.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-purple-700/20">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="font-medium">LKR {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Delivery Fee (8%)</span>
                  <span className="font-medium">LKR {deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200 dark:border-purple-700/20">
                  <span>Total</span>
                  <span className="text-purple-600 dark:text-purple-400">LKR {total.toFixed(2)}</span>
                </div>
              </div>

              {orderError && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                  {orderError}
                </div>
              )}

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isSubmittingOrder || items.length === 0}
                className="w-full mt-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-2xl font-semibold hover:shadow-[var(--glow-purple-strong)] transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isSubmittingOrder ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Address Modal */}
      {showAddressModal && (
        <AddressModal
          address={editingAddress}
          onSave={(addr) => {
            if (editingAddress) {
              handleEditAddress(addr as Address);
            } else {
              handleAddAddress(addr as Omit<Address, 'id'>);
            }
          }}
          onClose={() => {
            setShowAddressModal(false);
            setEditingAddress(null);
          }}
          userName={user?.name || 'John Doe'}
        />
      )}
    </div>
  );
}

function AddressModal({
  address,
  onSave,
  onClose,
  userName
}: {
  address: Address | null;
  onSave: (address: Address | Omit<Address, 'id'>) => void;
  onClose: () => void;
  userName: string;
}) {
  const [formData, setFormData] = useState<Omit<Address, 'id'>>({
    type: address?.type || '',
    name: address?.name || userName,
    address: address?.address || '',
    city: address?.city || '',
    message: address?.message || '',
    isCustom: address ? address.isCustom || false : true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address) {
      onSave({ ...formData, id: address.id, isCustom: address.isCustom });
    } else {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1a1425] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-purple-700/20">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-[#1a1425] border-b border-gray-200 dark:border-purple-700/20 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold">{address ? 'Edit Address' : 'Add New Address'}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2">Address Label *</label>
            <input
              type="text"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              placeholder="e.g., Home, Office, Grandma's House"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-purple-700/20 rounded-xl focus:outline-none focus:border-purple-600 dark:focus:border-purple-400"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Give this address a name to identify it easily
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Recipient's name"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-purple-700/20 rounded-xl focus:outline-none focus:border-purple-600 dark:focus:border-purple-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Street Address *</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Street address, apartment, suite, unit, etc."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-purple-700/20 rounded-xl focus:outline-none focus:border-purple-600 dark:focus:border-purple-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">City, State & ZIP *</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="e.g., New York, NY 10001"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-purple-700/20 rounded-xl focus:outline-none focus:border-purple-600 dark:focus:border-purple-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Delivery Instructions (Optional)
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Add any special instructions for the delivery person..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-purple-700/20 rounded-xl focus:outline-none focus:border-purple-600 dark:focus:border-purple-400 resize-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              e.g., "Ring the doorbell twice", "Leave at the back door", "Call when you arrive"
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-purple-700/20">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:shadow-[var(--glow-purple-strong)] transition-all hover:scale-105"
            >
              {address ? 'Update Address' : 'Add Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

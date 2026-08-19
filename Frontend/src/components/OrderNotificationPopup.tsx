import { useState, useEffect } from 'react';
import { Bell, X, User, MapPin, ShoppingCart, Clock, CheckCircle } from 'lucide-react';
import { DeliveryTask } from '../data/admin';

interface OrderNotificationPopupProps {
  pendingOrders: DeliveryTask[];
  onAcceptOrder: (taskId: string) => void;
  onDismiss: () => void;
}

export default function OrderNotificationPopup({
  pendingOrders,
  onAcceptOrder,
  onDismiss
}: OrderNotificationPopupProps) {
  const [selectedOrder, setSelectedOrder] = useState<DeliveryTask | null>(null);

  // Auto-select first order if available
  useEffect(() => {
    if (pendingOrders.length > 0 && !selectedOrder) {
      setSelectedOrder(pendingOrders[0]);
    }
  }, [pendingOrders]);

  if (pendingOrders.length === 0) return null;

  const handleAccept = () => {
    if (selectedOrder) {
      onAcceptOrder(selectedOrder.id);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onDismiss}
      />

      {/* Notification Card */}
      <div className="relative bg-white dark:bg-[#1a1425] rounded-3xl shadow-2xl border-2 border-purple-500 max-w-md w-full mx-4 overflow-hidden animate-slideUp">
        {/* Header with Pulsing Icon */}
        <div className="bg-linear-to-r from-purple-600 to-purple-700 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="w-8 h-8 text-white animate-bounce" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {pendingOrders.length}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">New Order Alert!</h2>
                <p className="text-purple-100 text-sm">
                  {pendingOrders.length} {pendingOrders.length === 1 ? 'order' : 'orders'} waiting
                </p>
              </div>
            </div>
            <button
              onClick={onDismiss}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Order Details */}
        {selectedOrder && (
          <div className="p-6 space-y-4">
            {/* Order Selection */}
            {pendingOrders.length > 1 && (
              <div>
                <label className="block text-sm font-semibold mb-2">Select Order:</label>
                <select
                  value={selectedOrder.id}
                  onChange={(e) => {
                    const order = pendingOrders.find(o => o.id === e.target.value);
                    setSelectedOrder(order || null);
                  }}
                  className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
                >
                  {pendingOrders.map(order => (
                    <option key={order.id} value={order.id}>
                      {order.orderId} - LKR {order.total.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Order Info */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg">{selectedOrder.orderId}</span>
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  LKR {selectedOrder.total.toFixed(2)}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">{selectedOrder.customerName}</span>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-600 dark:text-gray-400 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300 flex-1">
                    {selectedOrder.customerAddress}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {selectedOrder.deliveryTime === 'express' ? 'Express Delivery' : 'Standard Delivery'} - {selectedOrder.estimatedTime}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {selectedOrder.products.length} {selectedOrder.products.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>

              {/* Products List */}
              <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-700">
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Items:</div>
                <div className="space-y-1">
                  {selectedOrder.products.map((product, idx) => (
                    <div key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex justify-between">
                      <span>{product.name}</span>
                      <span>× {product.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={onDismiss}
                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 px-6 py-3 bg-linear-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:shadow-(--glow-purple-strong) transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Accept Order
              </button>
            </div>

            {/* Note */}
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              First to accept claims this order
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Package, CheckCircle, Clock, XCircle, Truck } from 'lucide-react';
import BackButton from '../components/common/BackButton';
import { orderService, Order } from '../services/orderService';

interface CustomerOrdersProps {
  onBack: () => void;
}

export default function CustomerOrders({ onBack }: CustomerOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      try {
        const data = await orderService.myOrders();
        if (!cancelled) setOrders(data);
      } catch (err) {
        if (!cancelled) setError('Could not load your orders. Please try again.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadOrders();
    return () => { cancelled = true; };
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'out_for_delivery': return <Truck className="w-5 h-5 text-purple-500" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'processing': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'out_for_delivery': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
      case 'cancelled': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-[#0f0a1e] dark:via-[#1a1425] dark:to-[#2d1b4e] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton onBack={onBack} />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">My Orders</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and manage your orders</p>
        </div>

        {isLoading && (
          <div className="text-center py-16 text-gray-500">Loading your orders...</div>
        )}

        {error && !isLoading && (
          <div className="text-center py-16 text-red-500">{error}</div>
        )}

        {!isLoading && !error && orders.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400">You haven't placed any orders yet.</p>
          </div>
        )}

        {/* Orders List */}
        {!isLoading && !error && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="backdrop-blur-xl bg-white/70 dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20 hover:border-purple-300 dark:hover:border-purple-600/50 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{order.order_number}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-purple-700/20">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                </span>
                <span className="text-xl font-bold text-purple-600 dark:text-purple-400">LKR {order.total.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}

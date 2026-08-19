import { useEffect, useState } from 'react';
import { Clock, Package, CheckCircle, XCircle } from 'lucide-react';
import BackButton from '../components/common/BackButton';
import { orderService, Order } from '../services/orderService';

interface CustomerActivityProps {
  onBack: () => void;
}

export default function CustomerActivity({ onBack }: CustomerActivityProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    orderService.myOrders()
      .then((data) => { if (!cancelled) setOrders(data); })
      .catch(() => { if (!cancelled) setError('Could not load your activity.'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const statusIcon = (status: string) => {
    if (status === 'delivered') return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (status === 'cancelled') return <XCircle className="w-5 h-5 text-red-500" />;
    return <Clock className="w-5 h-5 text-blue-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-[#0f0a1e] dark:via-[#1a1425] dark:to-[#2d1b4e] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6"><BackButton onBack={onBack} /></div>
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">My Activity</h1>
          <p className="text-gray-600 dark:text-gray-400">Your recent order activity</p>
        </div>

        {isLoading && <div className="text-center py-16 text-gray-500">Loading...</div>}
        {error && !isLoading && <div className="text-center py-16 text-red-500">{error}</div>}
        {!isLoading && !error && orders.length === 0 && (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">No activity yet.</div>
        )}

        {!isLoading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="backdrop-blur-xl bg-white/70 dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20">
                <div className="flex items-center gap-3 mb-2">
                  {statusIcon(order.status)}
                  <h3 className="font-bold text-gray-900 dark:text-white">{order.order_number}</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {new Date(order.created_at).toLocaleString()} • {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                </p>
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">LKR {order.total.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
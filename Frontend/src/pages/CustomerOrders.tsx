import { Package, CheckCircle, Clock, XCircle } from 'lucide-react';
import BackButton from '../components/common/BackButton';

interface CustomerOrdersProps {
  onBack: () => void;
}

export default function CustomerOrders({ onBack }: CustomerOrdersProps) {
  const orders = [
    { id: '#ORD-2024-001', date: '2026-05-25', status: 'delivered', total: 156.99, items: 5 },
    { id: '#ORD-2024-002', date: '2026-05-20', status: 'processing', total: 89.50, items: 3 },
    { id: '#ORD-2024-003', date: '2026-05-15', status: 'cancelled', total: 45.00, items: 2 }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'processing': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
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

        {/* Orders List */}
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="backdrop-blur-xl bg-white/70 dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20 hover:border-purple-300 dark:hover:border-purple-600/50 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{order.id}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(order.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-purple-700/20">
                <span className="text-sm text-gray-600 dark:text-gray-400">{order.items} items</span>
                <span className="text-xl font-bold text-purple-600 dark:text-purple-400">${order.total.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

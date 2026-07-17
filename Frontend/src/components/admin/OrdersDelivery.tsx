import { useEffect, useState } from 'react';
import { Truck, Package, CheckCircle, Clock, XCircle, User } from 'lucide-react';
import { orderService, Order, OrderStatus } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';

const STATUS_FLOW: OrderStatus[] = ['pending', 'processing', 'out_for_delivery', 'delivered'];

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_ICONS: Record<OrderStatus, typeof Package> = {
  pending: Clock,
  processing: Package,
  out_for_delivery: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
  processing: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  out_for_delivery: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  delivered: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};

export default function OrdersDelivery() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await orderService.staffList(statusFilter === 'all' ? undefined : statusFilter);
      setOrders(data);
    } catch (err) {
      setError('Could not load orders.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleAssignToSelf = async (orderId: number) => {
    setUpdatingId(orderId);
    try {
      await orderService.assignToSelf(orderId);
      await loadOrders();
    } catch (err) {
      alert('Failed to assign order. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAdvanceStatus = async (order: Order) => {
    const currentIndex = STATUS_FLOW.indexOf(order.status);
    const nextStatus = STATUS_FLOW[currentIndex + 1];
    if (!nextStatus) return;

    setUpdatingId(order.id);
    try {
      await orderService.updateStatus(order.id, nextStatus);
      await loadOrders();
    } catch (err) {
      alert('Failed to update order status. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancel = async (orderId: number) => {
    if (!confirm('Cancel this order?')) return;
    setUpdatingId(orderId);
    try {
      await orderService.updateStatus(orderId, 'cancelled');
      await loadOrders();
    } catch (err) {
      alert('Failed to cancel order. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Orders & Delivery</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage and track all customer orders</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['all', ...STATUS_FLOW, 'cancelled'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status as OrderStatus | 'all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              statusFilter === status
                ? 'bg-purple-600 text-white'
                : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 text-gray-700 dark:text-gray-300'
            }`}
          >
            {status === 'all' ? 'All Orders' : STATUS_LABELS[status as OrderStatus]}
          </button>
        ))}
      </div>

      {isLoading && <div className="text-center py-16 text-gray-500">Loading orders...</div>}
      {error && !isLoading && <div className="text-center py-16 text-red-500">{error}</div>}
      {!isLoading && !error && orders.length === 0 && (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">No orders in this status.</div>
      )}

      {!isLoading && !error && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => {
            const StatusIcon = STATUS_ICONS[order.status];
            const isAssignedToMe = order.assigned_to === user?.id;
            const canAdvance = order.status !== 'delivered' && order.status !== 'cancelled';

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${STATUS_COLORS[order.status]}`}>
                      <StatusIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{order.order_number}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {order.user?.name} • {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{order.delivery_address}</p>

                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-purple-700/20">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {order.items.reduce((sum, i) => sum + i.quantity, 0)} items
                  </span>
                  <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    LKR {order.total.toFixed(2)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <User className="w-4 h-4" />
                    {order.assigned_to ? (isAssignedToMe ? 'Assigned to you' : 'Assigned') : 'Unassigned'}
                  </div>

                  <div className="flex gap-2">
                    {!order.assigned_to && order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <button
                        onClick={() => handleAssignToSelf(order.id)}
                        disabled={updatingId === order.id}
                        className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-xl font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors disabled:opacity-50"
                      >
                        Assign to Me
                      </button>
                    )}

                    {canAdvance && (
                      <button
                        onClick={() => handleAdvanceStatus(order)}
                        disabled={updatingId === order.id}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-medium hover:shadow-[var(--glow-purple)] transition-all disabled:opacity-50"
                      >
                        {updatingId === order.id
                          ? 'Updating...'
                          : `Mark as ${STATUS_LABELS[STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1]]}`}
                      </button>
                    )}

                    {canAdvance && (
                      <button
                        onClick={() => handleCancel(order.id)}
                        disabled={updatingId === order.id}
                        className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
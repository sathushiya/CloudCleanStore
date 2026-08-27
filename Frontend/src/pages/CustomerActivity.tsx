import { useEffect, useState } from 'react';
import { Package, Clock, History } from 'lucide-react';
import BackButton from '../components/common/BackButton';
import OrderCard from '../components/customer/OrderCard';
import { orderService, Order } from '../services/orderService';
import { groupOrdersForActivity } from '../utils/orderActivity';

interface CustomerActivityProps {
  onBack: () => void;
  // Called after a reorder successfully adds at least one item to the
  // cart -- App.tsx handles the actual navigation to the cart, since that's
  // outside what this page has access to on its own.
  onReorder?: () => void;
}

interface SectionProps {
  title: string;
  description: string;
  icon: typeof Package;
  orders: Order[];
  emptyText: string;
  reviewingOrderId: number | null;
  onStartReview: (orderId: number) => void;
  onReviewSubmitted: (orderId: number, rating: number, comment: string) => void;
  onReorder?: () => void;
}

function ActivitySection({
  title,
  description,
  icon: Icon,
  orders,
  emptyText,
  reviewingOrderId,
  onStartReview,
  onReviewSubmitted,
  onReorder,
}: SectionProps) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-1">
        <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {title} <span className="text-gray-400 dark:text-gray-500 font-medium">({orders.length})</span>
        </h2>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 ml-12">{description}</p>

      {orders.length === 0 ? (
        <div className="ml-12 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 rounded-2xl px-4 py-6 text-center">
          {emptyText}
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isReviewing={reviewingOrderId === order.id}
              onStartReview={() => onStartReview(order.id)}
              onReviewSubmitted={onReviewSubmitted}
              onReorder={onReorder}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default function CustomerActivity({ onBack, onReorder }: CustomerActivityProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewingOrderId, setReviewingOrderId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    orderService.myOrders()
      .then((data) => { if (!cancelled) setOrders(data); })
      .catch(() => { if (!cancelled) setError('Could not load your activity.'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleReviewSubmitted = (orderId: number, rating: number, comment: string) => {
    setOrders((prev) => prev.map((o) => (
      o.id === orderId ? { ...o, review: { id: Date.now(), rating, comment } } : o
    )));
    setReviewingOrderId(null);
  };

  const { ongoing, pending, history } = groupOrdersForActivity(orders);

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-purple-100 dark:from-[#0f0a1e] dark:via-[#1a1425] dark:to-[#2d1b4e] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6"><BackButton onBack={onBack} /></div>
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">My Activity</h1>
          <p className="text-gray-600 dark:text-gray-400">Everything you've ordered, from pickup to delivery</p>
        </div>

        {isLoading && <div className="text-center py-16 text-gray-500">Loading...</div>}
        {error && !isLoading && <div className="text-center py-16 text-red-500">{error}</div>}

        {!isLoading && !error && orders.length === 0 && (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">No activity yet.</div>
        )}

        {!isLoading && !error && orders.length > 0 && (
          <div className="space-y-10">
            <ActivitySection
              title="Processing & Ongoing Orders"
              description="Being prepared or already on the way to you."
              icon={Package}
              orders={ongoing}
              emptyText="Nothing being processed right now."
              reviewingOrderId={reviewingOrderId}
              onStartReview={setReviewingOrderId}
              onReviewSubmitted={handleReviewSubmitted}
            />

            <ActivitySection
              title="Upcoming / Pending Delivery"
              description="Placed and waiting to be picked up by our team."
              icon={Clock}
              orders={pending}
              emptyText="No orders waiting for pickup."
              reviewingOrderId={reviewingOrderId}
              onStartReview={setReviewingOrderId}
              onReviewSubmitted={handleReviewSubmitted}
            />

            <ActivitySection
              title="Order History"
              description="Delivered and cancelled orders."
              icon={History}
              orders={history}
              emptyText="No completed orders yet."
              reviewingOrderId={reviewingOrderId}
              onStartReview={setReviewingOrderId}
              onReviewSubmitted={handleReviewSubmitted}
              onReorder={onReorder}
            />
          </div>
        )}
      </div>
    </div>
  );
}

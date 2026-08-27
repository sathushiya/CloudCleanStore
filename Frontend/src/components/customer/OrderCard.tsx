import { useState } from 'react';
import { toast } from 'sonner';
import { Clock, Package, Truck, CheckCircle, XCircle, User, MapPin, Star, RotateCcw } from 'lucide-react';
import type { Order, OrderStatus } from '../../services/orderService';
import { useProducts } from '../../hooks/queries/useProducts';
import { useCart } from '../../context/CartContext';
import { buildReorderItems } from '../../utils/reorder';
import ReviewForm from './ReviewForm';

const STATUS_META: Record<OrderStatus, { label: string; icon: typeof Package; badgeClass: string }> = {
  pending: {
    label: 'Pending Pickup',
    icon: Clock,
    badgeClass: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  },
  processing: {
    label: 'Processing',
    icon: Package,
    badgeClass: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    icon: Truck,
    badgeClass: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  },
  delivered: {
    label: 'Delivered',
    icon: CheckCircle,
    badgeClass: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    badgeClass: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  },
};

// Only "created_at"/"updated_at" are real, stored timestamps -- there's no
// scheduled/ETA field in the backend. "updated_at" naturally reflects the
// moment the order last changed status, since that's the only thing that
// touches it after creation, so it doubles as an honest "since" timestamp
// per status rather than a fabricated delivery window.
function timelineLabel(order: Order): string | null {
  const updated = new Date(order.updated_at ?? order.created_at).toLocaleString();
  switch (order.status) {
    case 'processing':
      return `Being prepared since ${updated}`;
    case 'out_for_delivery':
      return `Out for delivery since ${updated}`;
    case 'delivered':
      return `Delivered on ${updated}`;
    case 'cancelled':
      return `Cancelled on ${updated}`;
    default:
      return null;
  }
}

interface OrderCardProps {
  order: Order;
  isReviewing?: boolean;
  onStartReview?: () => void;
  onReviewSubmitted?: (orderId: number, rating: number, comment: string) => void;
  // Only passed for orders in Order History -- an active/pending order
  // doesn't need a "reorder" action.
  onReorder?: () => void;
}

export default function OrderCard({ order, isReviewing, onStartReview, onReviewSubmitted, onReorder }: OrderCardProps) {
  const meta = STATUS_META[order.status];
  const StatusIcon = meta.icon;
  const timeline = timelineLabel(order);
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  // React Query-cached (see hooks/queries/useProducts.ts) -- shares the same
  // cache entry as Shop.tsx/Products.tsx, so this usually doesn't need a
  // fresh network request at all by the time a customer reaches here.
  const { data: catalogPage } = useProducts({});
  const { addToCart } = useCart();
  const [reordering, setReordering] = useState(false);

  const handleReorder = async () => {
    setReordering(true);
    try {
      const { items, unavailableItemNames } = buildReorderItems(order, catalogPage?.data ?? []);

      items.forEach(({ product, variant, quantity }) => addToCart(product, variant, quantity));

      if (unavailableItemNames.length > 0) {
        toast.warning(
          items.length > 0
            ? `Added ${items.length} item${items.length !== 1 ? 's' : ''} to your cart. ${unavailableItemNames.join(', ')} ${unavailableItemNames.length !== 1 ? 'are' : 'is'} no longer available.`
            : `None of the items in this order are available anymore.`
        );
      } else if (items.length > 0) {
        toast.success(`Added ${items.length} item${items.length !== 1 ? 's' : ''} to your cart.`);
      }

      if (items.length > 0) {
        onReorder?.();
      }
    } finally {
      setReordering(false);
    }
  };

  return (
    <div className="backdrop-blur-xl bg-white/70 dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20 hover:border-purple-300 dark:hover:border-purple-600/50 transition-all">
      {/* Header: order number, status */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">{order.order_number}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Placed on {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${meta.badgeClass}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {meta.label}
        </span>
      </div>

      {/* Items -- the main thing a customer wants to see at a glance */}
      <div className="mb-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-purple-700/10 p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
          {totalItems} item{totalItems !== 1 ? 's' : ''} in this order
        </div>
        <ul className="space-y-2">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-gray-800 dark:text-gray-200">
                <span className="font-semibold text-purple-600 dark:text-purple-400">{item.quantity}×</span>{' '}
                {item.product_name}
                <span className="text-gray-500 dark:text-gray-400"> ({item.variant_size})</span>
              </span>
              <span className="shrink-0 font-medium text-gray-700 dark:text-gray-300">
                LKR {(item.price * item.quantity).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Delivery / handling details */}
      <div className="space-y-1.5 mb-4 text-sm text-gray-600 dark:text-gray-400">
        {timeline && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 shrink-0" />
            <span>{timeline}</span>
          </div>
        )}
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{order.delivery_address}</span>
        </div>
        {order.assigned_staff && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 shrink-0" />
            <span>Handled by {order.assigned_staff.name}</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-purple-700/20">
        <span className="text-sm text-gray-600 dark:text-gray-400">Order Total</span>
        <span className="text-xl font-bold text-purple-600 dark:text-purple-400">LKR {order.total.toFixed(2)}</span>
      </div>

      {/* Reorder -- Order History only (see the onReorder prop comment above) */}
      {onReorder && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-purple-700/20">
          <button
            onClick={handleReorder}
            disabled={reordering}
            className="w-full sm:w-auto px-5 py-2.5 bg-linear-to-r from-purple-600 to-purple-700 text-white rounded-xl text-sm font-semibold hover:shadow-(--glow-purple) transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4" />
            {reordering ? 'Adding to cart...' : 'Reorder'}
          </button>
        </div>
      )}

      {/* Review flow -- delivered orders only */}
      {order.status === 'delivered' && (
        order.review ? (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-purple-700/20">
            <div className="flex items-center gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${star <= order.review!.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{order.review.comment}</p>
          </div>
        ) : isReviewing ? (
          <ReviewForm order={order} onSubmitted={(id, rating, comment) => onReviewSubmitted?.(id, rating, comment)} />
        ) : (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-purple-700/20">
            <button
              onClick={onStartReview}
              className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors flex items-center gap-2"
            >
              <Star className="w-4 h-4" />
              Leave a Review
            </button>
          </div>
        )
      )}
    </div>
  );
}

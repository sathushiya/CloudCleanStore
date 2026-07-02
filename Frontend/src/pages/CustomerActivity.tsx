import { ArrowLeft, Package, Calendar, MapPin, RotateCcw, Check, X } from 'lucide-react';
import { orderHistory, OrderHistory } from '../data/orderHistory';
import { useCart } from '../context/CartContext';
import { ImageWithFallback } from '../components/common/ImageWithFallback';

interface CustomerActivityProps {
  onBack: () => void;
}

export default function CustomerActivity({ onBack }: CustomerActivityProps) {
  const { addToCart } = useCart();

  const handleOrderAgain = (order: OrderHistory) => {
    // Add all items from the order to cart
    order.items.forEach(item => {
      addToCart(item.product, item.variant, item.quantity);
    });

    // Show success message with confetti-style alert
    const itemText = order.items.length === 1 ? 'item' : 'items';
    alert(`✅ Success! ${order.items.length} ${itemText} added to your cart!`);
  };

  const getStatusColor = (status: OrderHistory['status']) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      case 'processing':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: OrderHistory['status']) => {
    switch (status) {
      case 'delivered':
        return <Check className="w-4 h-4" />;
      case 'cancelled':
        return <X className="w-4 h-4" />;
      case 'processing':
        return <RotateCcw className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0a1e] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => {
              console.log('[CustomerActivity] Back button clicked');
              onBack();
            }}
            className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-3xl font-bold mb-2">My Activity</h1>
          <p className="text-gray-600 dark:text-gray-400">
            View your order history and reorder with one click
          </p>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orderHistory.length === 0 ? (
            <div className="bg-white dark:bg-white/5 rounded-3xl p-12 border border-gray-200 dark:border-purple-700/20 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-xl font-bold mb-2">No Previous Orders</h3>
              <p className="text-gray-600 dark:text-gray-400">
                You haven't placed any orders yet. Start shopping to see your order history here!
              </p>
            </div>
          ) : (
            orderHistory.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20 hover:border-purple-500 dark:hover:border-purple-500 transition-all"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg">{order.orderNumber}</h3>
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(order.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {order.deliveryAddress}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        LKR {order.total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3 mb-4">
                  {order.items.map((item, index) => (
                    <div
                      key={`${item.product.id}-${item.variant.id}-${index}`}
                      className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl"
                    >
                      <ImageWithFallback
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{item.product.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.variant.size} • Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">
                          LKR {(item.variant.price * item.quantity).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          LKR {item.variant.price} each
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Again Button */}
                <button
                  onClick={() => handleOrderAgain(order)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:shadow-[var(--glow-purple-strong)] transition-all font-semibold"
                >
                  <RotateCcw className="w-5 h-5" />
                  Order Again
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

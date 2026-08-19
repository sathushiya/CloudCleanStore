import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ImageWithFallback } from './common/ImageWithFallback';

interface CartModalProps {
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartModal({ onClose, onCheckout }: CartModalProps) {
  const { items, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();

  const subtotal = getCartTotal();
  const deliveryFee = subtotal * 0.08;
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    onClose();
    onCheckout();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full sm:max-w-2xl max-h-[90vh] bg-white dark:bg-[#1a1425] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col rounded-t-3xl sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-purple-700/20">
          <div>
            <h2 className="text-2xl font-bold">Your Cart</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {items.length} item{items.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {items.length === 0 ? (
          /* Empty Cart */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ShoppingBag className="w-24 h-24 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Your cart is empty</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Add some products to get started
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-linear-to-r from-purple-600 to-purple-700 text-white rounded-2xl font-medium hover:shadow-(--glow-purple) transition-all"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.product.id}-${item.variant.id}`}
                  className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl"
                >
                  {/* Product Image */}
                  <div className="w-20 h-20 flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
                    <ImageWithFallback
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{item.product.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.product.brand}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
                        {item.variant.size}
                      </span>
                      <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                        LKR {item.variant.price.toFixed(2)}
                      </span>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full p-1">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.variant.id, item.quantity - 1)
                          }
                          className="w-7 h-7 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.variant.id, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.variant.stock}
                          className="w-7 h-7 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id, item.variant.id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      LKR {(item.variant.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}

              {/* Clear Cart */}
              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="w-full py-2 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {/* Summary */}
            <div className="border-t border-gray-200 dark:border-purple-700/20 p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="font-medium">LKR {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Delivery Fee (8%)</span>
                  <span className="font-medium">LKR {deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-purple-700/20">
                  <span>Total</span>
                  <span className="text-purple-600 dark:text-purple-400">LKR {total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-4 bg-linear-to-r from-purple-600 to-purple-700 text-white rounded-2xl font-semibold hover:shadow-(--glow-purple-strong) transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import BackButton from '../components/common/BackButton';

interface CustomerWishlistProps {
  onBack: () => void;
}

export default function CustomerWishlist({ onBack }: CustomerWishlistProps) {
  const wishlistItems = [
    { id: 1, name: 'Premium Bathroom Cleaner', brand: 'CleanPro', price: 24.99, image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=300' },
    { id: 2, name: 'Eco-Friendly Detergent', brand: 'GreenClean', price: 19.99, image: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=300' },
    { id: 3, name: 'Multi-Surface Cleaner', brand: 'SparkleMax', price: 15.99, image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=300' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-[#0f0a1e] dark:via-[#1a1425] dark:to-[#2d1b4e] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton onBack={onBack} />
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">My Wishlist</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">{wishlistItems.length} items saved</p>
        </div>

        {/* Wishlist Items */}
        <div className="space-y-4">
          {wishlistItems.map((item) => (
            <div key={item.id} className="backdrop-blur-xl bg-white/70 dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20 hover:border-purple-300 dark:hover:border-purple-600/50 transition-all">
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-2xl"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.brand}</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">LKR {item.price.toFixed(2)}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-[var(--glow-purple-strong)] transition-all flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                  <button className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-all flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

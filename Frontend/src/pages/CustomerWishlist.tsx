import { useEffect, useState } from 'react';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import BackButton from '../components/common/BackButton';
import { wishlistService } from '../services/wishlistService';
import { useCart } from '../context/CartContext';
import type { Product } from '../data/products';

interface CustomerWishlistProps {
  onBack: () => void;
}

interface WishlistEntry {
  wishlistId: number;
  product: Product;
}

export default function CustomerWishlist({ onBack }: CustomerWishlistProps) {
  const [items, setItems] = useState<WishlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  const loadWishlist = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await wishlistService.list();
      setItems(data);
    } catch (err) {
      setError('Could not load your wishlist.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemove = async (productId: string) => {
    try {
      await wishlistService.remove(Number(productId));
      setItems(items.filter((item) => item.product.id !== productId));
    } catch (err) {
      alert('Failed to remove item. Please try again.');
    }
  };

  const handleAddToCart = (product: Product) => {
    if (product.variants.length === 0) return;
    addToCart(product, product.variants[0], 1);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-purple-100 dark:from-[#0f0a1e] dark:via-[#1a1425] dark:to-[#2d1b4e] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <BackButton onBack={onBack} />
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">My Wishlist</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">{items.length} items saved</p>
        </div>

        {isLoading && <div className="text-center py-16 text-gray-500">Loading your wishlist...</div>}
        {error && !isLoading && <div className="text-center py-16 text-red-500">{error}</div>}
        {!isLoading && !error && items.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400">Your wishlist is empty.</p>
          </div>
        )}

        {!isLoading && !error && items.length > 0 && (
          <div className="space-y-4">
            {items.map(({ product }) => (
              <div key={product.id} className="backdrop-blur-xl bg-white/70 dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20 hover:border-purple-300 dark:hover:border-purple-600/50 transition-all">
                <div className="flex items-center gap-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-24 h-24 object-cover rounded-2xl"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{product.brand}</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      LKR {(product.variants[0]?.price ?? 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="px-4 py-2 bg-linear-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-(--glow-purple-strong) transition-all flex items-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleRemove(product.id)}
                      className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-all flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

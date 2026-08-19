import { useEffect, useState } from 'react';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { ImageWithFallback } from './common/ImageWithFallback';
import { useCart } from '../context/CartContext';
import { productService, toFrontendProduct } from '../services/productService';
import { wishlistService } from '../services/wishlistService';
import type { Product } from '../data/products';

interface ProductsProps {
  onNavigateToLogin?: () => void;
  onNavigateToShop?: () => void;
  isAuthenticated?: boolean;
}

export default function Products({ onNavigateToLogin, onNavigateToShop, isAuthenticated }: ProductsProps = {}) {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    productService.list({}).then((paginated) => {
      if (!cancelled) {
        setProducts(paginated.data.map(toFrontendProduct).slice(0, 8));
      }
    }).finally(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }
    let cancelled = false;
    wishlistService.list().then((items) => {
      if (!cancelled) setWishlist(items.map((i) => i.product.id));
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [isAuthenticated]);

    const handleViewAllClick = () => {
    onNavigateToShop?.();
  };

  const handleAddToCart = (product: Product) => {
    if (!isAuthenticated) {
      onNavigateToLogin?.();
      return;
    }
    addToCart(product, product.variants[0], 1);
  };

  const handleToggleWishlist = async (product: Product) => {
    if (!isAuthenticated) {
      onNavigateToLogin?.();
      return;
    }
    try {
      if (wishlist.includes(product.id)) {
        await wishlistService.remove(Number(product.id));
        setWishlist((prev) => prev.filter((id) => id !== product.id));
      } else {
        await wishlistService.add(Number(product.id));
        setWishlist((prev) => [...prev, product.id]);
      }
    } catch (err) {
      // Non-fatal on the landing page -- the full Wishlist page will surface any real issue
    }
  };

  return (
    <section className="py-16 md:py-24 bg-gray-50/50 dark:bg-transparent" id="products">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
            Featured Products
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Premium Cleaning Solutions
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Professional-grade products trusted by thousands of homes and businesses
          </p>
        </div>

        {isLoading && (
          <div className="text-center py-12 text-gray-500">Loading products...</div>
        )}

        {!isLoading && products.length === 0 && (
          <div className="text-center py-12 text-gray-500">No products available yet.</div>
        )}

        {!isLoading && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group relative backdrop-blur-xl bg-white dark:bg-white/5 rounded-3xl overflow-hidden border border-gray-200 dark:border-purple-700/20 hover:border-purple-300 dark:hover:border-purple-600/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2"
            >
              <div className="relative h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                <button
                  onClick={() => handleToggleWishlist(product)}
                  className="absolute top-3 right-3 w-10 h-10 bg-white/90 dark:bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-black/70 transition-colors shadow-lg"
                >
                  <Heart
                    className={`w-5 h-5 transition-colors ${
                      wishlist.includes(product.id)
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  />
                </button>

                {product.badge && (
                  <div className="absolute top-3 left-3 px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded-full">
                    {product.badge}
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">
                  {product.brand}
                </div>
                <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {product.name}
                </h3>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium ml-1">{product.rating}</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({product.reviews})
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                      From LKR {product.variants[0]?.price.toFixed(2) ?? '0.00'}
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-10 h-10 bg-linear-to-br from-purple-600 to-purple-700 text-white rounded-full flex items-center justify-center hover:shadow-(--glow-purple) transition-all hover:scale-110"
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

        <div className="text-center mt-12">
          <button
            onClick={handleViewAllClick}
            className="px-8 py-4 bg-linear-to-r from-purple-600 to-purple-700 text-white rounded-full font-medium hover:shadow-(--glow-purple-strong) transition-all hover:scale-105"
          >
            View All Products
          </button>
        </div>
      </div>
    </section>
  );
}
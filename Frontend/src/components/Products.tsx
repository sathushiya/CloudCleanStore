import { useState } from 'react';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { ImageWithFallback } from './common/ImageWithFallback';
import { useCart } from '../context/CartContext';

interface ProductsProps {
  onNavigateToLogin?: () => void;
  onNavigateToShop?: () => void;
  isAuthenticated?: boolean;
}

const products = [
  {
    id: 1,
    name: 'Multi-Surface Spray Cleaner',
    brand: 'CleanPro',
    price: 12.99,
    originalPrice: 16.99,
    rating: 4.8,
    reviews: 234,
    image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500',
    badge: 'Best Seller'
  },
  {
    id: 2,
    name: 'Eco-Friendly Glass Cleaner',
    brand: 'GreenClean',
    price: 9.99,
    rating: 4.6,
    reviews: 189,
    image: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500',
    badge: 'Eco-Friendly'
  },
  {
    id: 3,
    name: 'Premium Floor Polish',
    brand: 'ShineMax',
    price: 18.99,
    rating: 4.9,
    reviews: 456,
    image: 'https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500',
    badge: 'Premium'
  },
  {
    id: 4,
    name: 'Industrial Degreaser',
    brand: 'PowerClean',
    price: 24.99,
    rating: 4.7,
    reviews: 312,
    image: 'https://images.unsplash.com/photo-1626379481874-3dc5678fa8ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500'
  },
  {
    id: 5,
    name: 'Disinfectant Spray',
    brand: 'SafeGuard',
    price: 14.99,
    rating: 4.8,
    reviews: 567,
    image: 'https://images.unsplash.com/photo-1550963295-019d8a8a61c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500',
    badge: 'New'
  },
  {
    id: 6,
    name: 'Bathroom Tile Cleaner',
    brand: 'TileShine',
    price: 11.99,
    rating: 4.5,
    reviews: 198,
    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500'
  },
  {
    id: 7,
    name: 'Laundry Detergent Pro',
    brand: 'FreshWash',
    price: 19.99,
    rating: 4.9,
    reviews: 892,
    image: 'https://images.unsplash.com/photo-1648735257013-2fb9604b15c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500',
    badge: 'Top Rated'
  },
  {
    id: 8,
    name: 'Kitchen Deodorizer',
    brand: 'FreshAir',
    price: 8.99,
    rating: 4.4,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1632243575963-3143700087ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500'
  }
];

export default function Products({ onNavigateToLogin, onNavigateToShop, isAuthenticated }: ProductsProps = {}) {
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState<number[]>([]);

  const handleViewAllClick = () => {
    if (isAuthenticated) {
      onNavigateToShop?.();
    } else {
      onNavigateToLogin?.();
    }
  };

  const handleAddToCart = (product: typeof products[0]) => {
    if (!isAuthenticated) {
      onNavigateToLogin?.();
      return;
    }

    // Create a Product object matching the expected structure
    const fullProduct = {
      id: product.id.toString(),
      name: product.name,
      brand: product.brand,
      category: 'featured',
      description: product.name,
      image: product.image,
      rating: product.rating,
      reviews: product.reviews,
      variants: [
        {
          id: `${product.id}-default`,
          size: 'Standard',
          price: product.price,
          stock: 100
        }
      ],
      badge: product.badge
    };

    // Add to cart with the first variant
    addToCart(fullProduct, fullProduct.variants[0], 1);
  };

  const handleToggleWishlist = (productId: number) => {
    if (!isAuthenticated) {
      onNavigateToLogin?.();
      return;
    }
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <section className="py-16 md:py-24 bg-gray-50/50 dark:bg-transparent" id="products">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
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

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group relative backdrop-blur-xl bg-white dark:bg-white/5 rounded-3xl overflow-hidden border border-gray-200 dark:border-purple-700/20 hover:border-purple-300 dark:hover:border-purple-600/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2"
            >
              {/* Product image */}
              <div className="relative h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {/* Wishlist button */}
                <button
                  onClick={() => handleToggleWishlist(product.id)}
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

                {/* Badge */}
                {product.badge && (
                  <div className="absolute top-3 left-3 px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded-full">
                    {product.badge}
                  </div>
                )}
              </div>

              {/* Product info */}
              <div className="p-5">
                <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">
                  {product.brand}
                </div>
                <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium ml-1">{product.rating}</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({product.reviews})
                  </span>
                </div>

                {/* Price and CTA */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                      LKR {product.price.toFixed(2)}
                    </div>
                    {product.originalPrice && (
                      <div className="text-xs text-gray-500 line-through">
                        LKR {product.originalPrice.toFixed(2)}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-full flex items-center justify-center hover:shadow-[var(--glow-purple)] transition-all hover:scale-110"
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View all button */}
        <div className="text-center mt-12">
          <button
            onClick={handleViewAllClick}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full font-medium hover:shadow-[var(--glow-purple-strong)] transition-all hover:scale-105"
          >
            View All Products
          </button>
        </div>
      </div>
    </section>
  );
}

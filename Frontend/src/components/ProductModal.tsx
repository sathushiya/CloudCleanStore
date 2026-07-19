import { useState, useEffect } from 'react';
import { X, Star, ShoppingCart, Plus, Minus, Check, Heart } from 'lucide-react';
import { Product, ProductVariant } from '../data/products';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { wishlistService } from '../services/wishlistService';
import { ImageWithFallback } from './common/ImageWithFallback';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onRequireLogin: () => void;
}

export default function ProductModal({ product, onClose, onRequireLogin }: ProductModalProps) {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Bug fix: previously this always started as `false`, so the heart never
  // showed as filled even for products already on the wishlist. Now it checks
  // the real saved state whenever a different product is opened.
  // Guests never have a wishlist, so skip the (401-bound) request entirely.
  useEffect(() => {
    if (!isAuthenticated) {
      setWishlisted(false);
      return;
    }
    let cancelled = false;
    wishlistService.list()
      .then((items) => {
        if (!cancelled) {
          setWishlisted(items.some((item) => item.product.id === product.id));
        }
      })
      .catch(() => {
        // Request failed -- default to unwishlisted, no error shown here
        // since this is a background check, not a user-initiated action.
      });
    return () => { cancelled = true; };
  }, [product.id, isAuthenticated]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      onRequireLogin();
      return;
    }
    addToCart(product, selectedVariant, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      onRequireLogin();
      return;
    }
    setWishlistLoading(true);
    try {
      if (wishlisted) {
        await wishlistService.remove(Number(product.id));
        setWishlisted(false);
      } else {
        await wishlistService.add(Number(product.id));
        setWishlisted(true);
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        alert('Please log in to use the wishlist.');
      } else {
        alert('Something went wrong updating your wishlist. Please try again.');
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  const incrementQuantity = () => {
    if (quantity < selectedVariant.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#1a1425] rounded-3xl shadow-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white dark:bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-black/70 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="overflow-y-auto max-h-[90vh]">
          <div className="grid md:grid-cols-2 gap-8 p-6 md:p-8">
            <div className="relative">
              <div className="relative h-96 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden">
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.badge && (
                  <div className="absolute top-4 left-4 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-full">
                    {product.badge}
                  </div>
                )}
                {(() => {
                  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
                  const isInStock = totalStock > 0;
                  const isLowStock = totalStock > 0 && totalStock < 20;

                  return (
                    <div className={`absolute top-4 ${product.badge ? 'left-auto right-4' : 'left-4'} px-4 py-2 text-sm font-medium rounded-full ${
                      !isInStock
                        ? 'bg-red-500 text-white'
                        : isLowStock
                        ? 'bg-orange-500 text-white'
                        : 'bg-green-500 text-white'
                    }`}>
                      {!isInStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                    </div>
                  );
                })()}
              </div>

              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold">{product.rating}</span>
                <span className="text-gray-600 dark:text-gray-400">
                  ({product.reviews} reviews)
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-2">
                {product.brand}
              </div>
              <h2 className="text-3xl font-bold mb-4">{product.name}</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{product.description}</p>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3">Select Size:</label>
                <div className="grid grid-cols-3 gap-3">
                  {product.variants.map((variant) => {
                    const isOutOfStock = variant.stock === 0;
                    const isLowStock = variant.stock > 0 && variant.stock < 10;

                    return (
                      <button
                        key={variant.id}
                        onClick={() => {
                          if (!isOutOfStock) {
                            setSelectedVariant(variant);
                            setQuantity(1);
                          }
                        }}
                        disabled={isOutOfStock}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          isOutOfStock
                            ? 'opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                            : selectedVariant.id === variant.id
                            ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                        }`}
                      >
                        <div className="font-semibold">{variant.size}</div>
                        <div className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                          LKR {variant.price.toFixed(2)}
                        </div>
                        <div className={`text-xs mt-1 font-medium ${
                          isOutOfStock
                            ? 'text-red-500'
                            : isLowStock
                            ? 'text-orange-500'
                            : 'text-green-500'
                        }`}>
                          {isOutOfStock ? 'Out of Stock' : isLowStock ? `Only ${variant.stock} left` : 'In Stock'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3">Quantity:</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-full p-1">
                    <button
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                    <button
                      onClick={incrementQuantity}
                      disabled={quantity >= selectedVariant.stock}
                      className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedVariant.stock} available
                  </span>
                </div>
              </div>

              <div className="mt-auto">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Price</div>
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      LKR {(selectedVariant.price * quantity).toFixed(2)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    LKR {selectedVariant.price.toFixed(2)} × {quantity}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={selectedVariant.stock === 0}
                    className="flex-1 py-4 bg-linear-to-r from-purple-600 to-purple-700 text-white rounded-2xl font-semibold hover:shadow-(--glow-purple-strong) transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    {added ? (
                      <>
                        <Check className="w-5 h-5" />
                        Added to Cart!
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        Add to Cart
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleToggleWishlist}
                    disabled={wishlistLoading}
                    className="w-14 h-14 shrink-0 rounded-2xl border border-gray-200 dark:border-purple-700/20 flex items-center justify-center hover:border-purple-500 transition-colors disabled:opacity-50"
                  >
                    <Heart className={`w-6 h-6 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Star, ShoppingCart } from 'lucide-react';
import { categories } from '../data/products';
import { Product } from '../data/products';
import { productService, toFrontendProduct } from '../services/productService';
import SearchBar from '../components/common/SearchBar';
import ProductModal from '../components/ProductModal';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import BackButton from '../components/common/BackButton';

interface ShopProps {
  onBack: () => void;
  onRequireLogin: () => void;
}

export default function Shop({ onBack, onRequireLogin }: ShopProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]); // unfiltered, used only for real category counts
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<{ id: number; name: string } | null>(null);

  // Fetch the full unfiltered catalog once, purely to compute real per-category counts
  useEffect(() => {
  let cancelled = false;

  async function loadProducts() {
    setIsLoading(true);
    setError(null);
    try {
      const filters: { category?: string; brand_id?: number } = {};
      if (selectedCategory !== 'all') filters.category = selectedCategory;
      if (selectedBrandFilter) filters.brand_id = selectedBrandFilter.id;

      const paginated = await productService.list(filters);
      if (!cancelled) {
        setProducts(paginated.data.map(toFrontendProduct));
      }
    } catch (err) {
      if (!cancelled) setError('Could not load products. Please try again.');
    } finally {
      if (!cancelled) setIsLoading(false);
    }
  }

  loadProducts();
  return () => { cancelled = true; };
}, [selectedCategory, selectedBrandFilter]);

  const categoryCounts = categories.reduce<Record<string, number>>((acc, cat) => {
    acc[cat.id] = allProducts.filter((p) => p.category === cat.id).length;
    return acc;
  }, {});

  // Check for category filter from sessionStorage on mount
  useEffect(() => {
  const categoryFromSession = sessionStorage.getItem('selectedCategory');
  if (categoryFromSession) {
    setSelectedCategory(categoryFromSession);
    sessionStorage.removeItem('selectedCategory');
  }

  const brandIdFromSession = sessionStorage.getItem('selectedBrandId');
  const brandNameFromSession = sessionStorage.getItem('selectedBrandName');
  if (brandIdFromSession) {
    setSelectedBrandFilter({ id: Number(brandIdFromSession), name: brandNameFromSession || '' });
    sessionStorage.removeItem('selectedBrandId');
    sessionStorage.removeItem('selectedBrandName');
  }
}, []);

  // Fetch products whenever the category filter changes
  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setIsLoading(true);
      setError(null);
      try {
        const paginated = await productService.list(
          selectedCategory === 'all' ? {} : { category: selectedCategory }
        );
        if (!cancelled) {
          setProducts(paginated.data.map(toFrontendProduct));
        }
      } catch (err) {
        if (!cancelled) setError('Could not load products. Please try again.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadProducts();
    return () => { cancelled = true; };
  }, [selectedCategory]);

  const filteredProducts = products;

  return (
    <section className="py-8 md:py-16 min-h-screen" id="shop">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <BackButton onBack={onBack} />
        </div>

        <div className="mb-8">
          <SearchBar products={allProducts} onProductSelect={setSelectedProduct} />
        </div>

        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 text-gray-700 dark:text-gray-300 hover:border-purple-300 dark:hover:border-purple-600'
            }`}
          >
            All Products ({allProducts.length})
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 text-gray-700 dark:text-gray-300 hover:border-purple-300 dark:hover:border-purple-600'
              }`}
            >
              {category.name} ({categoryCounts[category.id] ?? 0})
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="text-center py-16 text-gray-500">Loading products...</div>
        )}

        {error && !isLoading && (
          <div className="text-center py-16 text-red-500">{error}</div>
        )}

        {!isLoading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
            const isInStock = totalStock > 0;
            const isLowStock = totalStock > 0 && totalStock < 20;

            return (
              <div
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className="group relative backdrop-blur-xl bg-white dark:bg-white/5 rounded-3xl overflow-hidden border border-gray-200 dark:border-purple-700/20 hover:border-purple-300 dark:hover:border-purple-600/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2 cursor-pointer"
              >
                <div className="relative h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  {product.badge && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded-full">
                      {product.badge}
                    </div>
                  )}

                  <div className={`absolute top-3 ${product.badge ? 'left-auto right-3' : 'left-3'} px-3 py-1 text-xs font-medium rounded-full ${
                    !isInStock
                      ? 'bg-red-500/90 text-white'
                      : isLowStock
                      ? 'bg-orange-500/90 text-white'
                      : 'bg-green-500/90 text-white'
                  }`}>
                    {!isInStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                  </div>

                  {isInStock && (
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-10 h-10 bg-linear-to-br from-purple-600 to-purple-700 text-white rounded-full flex items-center justify-center hover:shadow-(--glow-purple) transition-all hover:scale-110">
                        <ShoppingCart className="w-5 h-5" />
                      </button>
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
                      From LKR {product.variants[0].price.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {product.variants.length} size{product.variants.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>
        )}

        {!isLoading && !error && filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400">No products found in this category</p>
          </div>
        )}
      </div>

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onRequireLogin={onRequireLogin} />
      )}

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
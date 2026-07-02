import { useState } from 'react';
import { X, Search, ShoppingCart, Star } from 'lucide-react';
import { products, categories } from '../data/products';
import { Product } from '../data/products';
import ProductModal from './ProductModal';
import { ImageWithFallback } from './common/ImageWithFallback';

interface DashboardSearchModalProps {
  onClose: () => void;
}

export default function DashboardSearchModal({ onClose }: DashboardSearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter((product) => {
    const matchesQuery =
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.brand.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

    return matchesQuery && matchesCategory;
  });

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#1a1425] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-purple-700/20">
            <div className="flex items-center gap-4 flex-1">
              <Search className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, brands, categories..."
                className="flex-1 text-xl font-semibold bg-transparent focus:outline-none"
                autoFocus
              />
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 p-4 border-b border-gray-200 dark:border-purple-700/20 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto p-6">
            {query === '' && selectedCategory === 'all' ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-xl font-bold mb-2">Start searching</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Search for products by name, brand, or category
                </p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} found
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className="group bg-gray-50 dark:bg-gray-900/50 rounded-2xl overflow-hidden border border-gray-200 dark:border-purple-700/20 hover:border-purple-300 dark:hover:border-purple-600/50 transition-all hover:shadow-lg cursor-pointer"
                    >
                      <div className="relative h-40 bg-gray-100 dark:bg-gray-800">
                        <ImageWithFallback
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {product.badge && (
                          <div className="absolute top-2 left-2 px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded-full">
                            {product.badge}
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">
                          {product.brand}
                        </div>
                        <h4 className="font-semibold mb-2 line-clamp-2">{product.name}</h4>

                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium ml-1">{product.rating}</span>
                          </div>
                          <span className="text-xs text-gray-500">({product.reviews})</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            From LKR {product.variants[0].price.toFixed(2)}
                          </div>
                          <button className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors">
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Search className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-xl font-bold mb-2">No products found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try a different search term or category
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}

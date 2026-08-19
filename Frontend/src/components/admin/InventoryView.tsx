import { useState } from 'react';
import { Search, Package, AlertCircle } from 'lucide-react';
import { products as initialProducts, Product, categories } from '../../data/products';
import { ImageWithFallback } from '../common/ImageWithFallback';

export default function InventoryView() {
  const [products] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Format stock value
  const formatStock = (value: number | null | undefined): string | number => {
    if (value === null || value === undefined) {
      return 0;
    }
    return value;
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort products: low stock first
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aLowStock = a.variants.some((v) => (v.stock || 0) < 10);
    const bLowStock = b.variants.some((v) => (v.stock || 0) < 10);
    if (aLowStock && !bLowStock) return -1;
    if (!aLowStock && bLowStock) return 1;
    return 0;
  });

  const lowStockProducts = products.filter((p) => p.variants.some((v) => (v.stock || 0) < 10));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {products.length} total products • {lowStockProducts.length} low stock items
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none transition-colors text-gray-900 dark:text-white"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none transition-colors text-gray-900 dark:text-white"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-orange-900 dark:text-orange-300">Low Stock Alert</h3>
            <p className="text-sm text-orange-700 dark:text-orange-400">
              {lowStockProducts.length} product{lowStockProducts.length !== 1 ? 's' : ''} running low on stock
            </p>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedProducts.map((product) => {
          const hasLowStock = product.variants.some((v) => (v.stock || 0) < 10);
          return (
            <div
              key={product.id}
              className="bg-white dark:bg-white/5 rounded-3xl overflow-hidden border border-gray-200 dark:border-purple-700/20"
            >
              <div className="relative h-48 bg-gray-100 dark:bg-gray-800">
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {hasLowStock && (
                  <div className="absolute top-3 left-3 px-3 py-1 bg-orange-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Low Stock
                  </div>
                )}
                {product.badge && (
                  <div className="absolute top-3 right-3 px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded-full">
                    {product.badge}
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">
                  {product.brand}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{product.name}</h3>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Category:</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {categories.find((c) => c.id === product.category)?.name}
                    </span>
                  </div>

                  {/* Variants Stock Display */}
                  {product.variants.map((variant, index) => (
                    <div
                      key={variant.id}
                      className={`p-3 rounded-xl ${
                        (variant.stock || 0) < 10
                          ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700/30'
                          : 'bg-gray-50 dark:bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{variant.size}</span>
                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                          LKR {variant.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Stock:</span>
                        <span
                          className={`text-sm font-bold ${
                            (variant.stock || 0) < 10
                              ? 'text-orange-600 dark:text-orange-400'
                              : 'text-green-600 dark:text-green-400'
                          }`}
                        >
                          {formatStock(variant.stock)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sortedProducts.length === 0 && (
        <div className="text-center py-16">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No products found</h3>
          <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}

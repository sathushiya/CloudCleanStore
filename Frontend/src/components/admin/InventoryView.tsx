import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { Search, Package, AlertCircle, Edit2, Check, X } from 'lucide-react';
import { categories, Product } from '../../data/products';
import { productService, toFrontendProduct } from '../../services/productService';
import { ImageWithFallback } from '../common/ImageWithFallback';

const LOW_STOCK_THRESHOLD = 10;

export default function InventoryView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [editShopStock, setEditShopStock] = useState(0);
  const [editOnlineStock, setEditOnlineStock] = useState(0);
  const [saving, setSaving] = useState(false);

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const apiProducts = await productService.adminList();
      setProducts(apiProducts.map(toFrontendProduct));
    } catch {
      setError('Could not load inventory from the server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const formatStock = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return 'Not set';
    return String(value);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aLowStock = a.variants.some((v) => (v.stock ?? 0) < LOW_STOCK_THRESHOLD);
    const bLowStock = b.variants.some((v) => (v.stock ?? 0) < LOW_STOCK_THRESHOLD);
    if (aLowStock && !bLowStock) return -1;
    if (!aLowStock && bLowStock) return 1;
    return 0;
  });

  const lowStockProducts = products.filter((p) => p.variants.some((v) => (v.stock ?? 0) < LOW_STOCK_THRESHOLD));

  const startEditing = (variant: Product['variants'][number]) => {
    setEditingVariantId(variant.id);
    setEditShopStock(variant.shopStock ?? 0);
    setEditOnlineStock(variant.onlineStock ?? 0);
  };

  const cancelEditing = () => setEditingVariantId(null);

  const saveStock = async (variantId: string) => {
    setSaving(true);
    try {
      await productService.updateVariantStock(Number(variantId), {
        shop_stock: editShopStock,
        online_stock: editOnlineStock,
      });
      await loadProducts();
      setEditingVariantId(null);
    } catch {
      toast.error('Failed to update stock. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {products.length} total products • {lowStockProducts.length} low stock items
          </p>
        </div>
      </div>

      {isLoading && <div className="text-center py-8 text-gray-500">Loading inventory...</div>}
      {error && !isLoading && <div className="text-center py-8 text-red-500">{error}</div>}

      {!isLoading && !error && (
        <>
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

          {lowStockProducts.length > 0 && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700/30 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-900 dark:text-orange-300">Low Stock Alert</h3>
                <p className="text-sm text-orange-700 dark:text-orange-400">
                  {lowStockProducts.length} product{lowStockProducts.length !== 1 ? 's' : ''} running low on stock
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProducts.map((product) => {
              const hasLowStock = product.variants.some((v) => (v.stock ?? 0) < LOW_STOCK_THRESHOLD);
              return (
                <div
                  key={product.id}
                  className="bg-white dark:bg-white/5 rounded-3xl overflow-hidden border border-gray-200 dark:border-purple-700/20"
                >
                  <div className="relative h-48 bg-gray-100 dark:bg-gray-800">
                    <ImageWithFallback src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    {hasLowStock && (
                      <div className="absolute top-3 left-3 px-3 py-1 bg-orange-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Low Stock
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

                      {product.variants.map((variant) => {
                        const isEditing = editingVariantId === variant.id;

                        return (
                          <div
                            key={variant.id}
                            className={`p-3 rounded-xl ${
                              (variant.stock ?? 0) < LOW_STOCK_THRESHOLD
                                ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700/30'
                                : 'bg-gray-50 dark:bg-gray-800/50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{variant.size}</span>
                              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                                LKR {variant.price.toFixed(2)}
                              </span>
                            </div>

                            {!isEditing ? (
                              <div className="flex items-center justify-between">
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  Shop: <span className="font-semibold">{formatStock(variant.shopStock)}</span>
                                  {'  '}• Online: <span className="font-semibold">{formatStock(variant.onlineStock)}</span>
                                </div>
                                <button
                                  onClick={() => startEditing(variant)}
                                  className="p-1.5 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-[10px] text-gray-500 block mb-0.5">Shop Stock</label>
                                    <input
                                      type="number"
                                      min={0}
                                      value={editShopStock}
                                      onChange={(e) => setEditShopStock(Number(e.target.value))}
                                      className="w-full px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-gray-500 block mb-0.5">Online Stock</label>
                                    <input
                                      type="number"
                                      min={0}
                                      value={editOnlineStock}
                                      onChange={(e) => setEditOnlineStock(Number(e.target.value))}
                                      className="w-full px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white"
                                    />
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => saveStock(variant.id)}
                                    disabled={saving}
                                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-medium disabled:opacity-50"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    {saving ? 'Saving...' : 'Save'}
                                  </button>
                                  <button
                                    onClick={cancelEditing}
                                    disabled={saving}
                                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium disabled:opacity-50"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
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
        </>
      )}
    </div>
  );
}
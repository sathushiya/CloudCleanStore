import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Package, AlertCircle, X, Save } from 'lucide-react';
import { Product, ProductVariant, categories } from '../../data/products';
import { productService, toFrontendProduct, Brand } from '../../services/productService';
import ImageUploader from './ImageUploader';
import { ImageWithFallback } from '../common/ImageWithFallback';

export default function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadProducts = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const apiProducts = await productService.adminList();
      setProducts(apiProducts.map(toFrontendProduct));
    } catch (err) {
      setLoadError('Could not load products from the server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const apiBrands = await productService.adminListBrands();
        if (!cancelled) setBrands(apiBrands);
      } catch (err) {}
    })();

    loadProducts();
    return () => { cancelled = true; };
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockProducts = products.filter((p) => p.variants.some((v) => v.stock < 10));

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await productService.remove(Number(productId));
      setProducts(products.filter((p) => p.id !== productId));
    } catch (err) {
      alert('Failed to delete product. Please try again.');
    }
  };

  const handleSaveProduct = async (updatedProduct: Product) => {
    if (!updatedProduct.brandId) {
      alert('Please select a brand before saving.');
      return;
    }
    try {
      await productService.update(Number(updatedProduct.id), {
        brand_id: updatedProduct.brandId,
        name: updatedProduct.name,
        category: updatedProduct.category as any,
        description: updatedProduct.description,
        image: updatedProduct.image,
        badge: updatedProduct.badge,
        variants: updatedProduct.variants.map((v) => ({
          size: v.size,
          price: v.price,
          shop_stock: v.shopStock ?? 0,
          online_stock: v.onlineStock ?? v.stock,
        })),
      });
      await loadProducts();
      setEditingProduct(null);
    } catch (err) {
      alert('Failed to save product. Please check all fields and try again.');
    }
  };

  const handleAddProduct = async (newProduct: Product) => {
    if (!newProduct.brandId) {
      alert('Please select a brand before adding.');
      return;
    }
    try {
      await productService.create({
        brand_id: newProduct.brandId,
        name: newProduct.name,
        category: newProduct.category as any,
        description: newProduct.description,
        image: newProduct.image,
        badge: newProduct.badge,
        variants: newProduct.variants.map((v) => ({
          size: v.size,
          price: v.price,
          shop_stock: v.shopStock ?? 0,
          online_stock: v.onlineStock ?? v.stock,
        })),
      });
      await loadProducts();
      setShowAddModal(false);
    } catch (err) {
      alert('Failed to add product. Please check all fields and try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Product Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your product inventory
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-linear-to-r from-purple-600 to-purple-700 text-white rounded-xl font-medium hover:shadow-(--glow-purple) transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {isLoading && (
        <div className="text-center py-8 text-gray-500">Loading products...</div>
      )}
      {loadError && !isLoading && (
        <div className="text-center py-8 text-red-500">{loadError}</div>
      )}

      {/* Total Products Metric */}
      <div className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
            <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          {lowStockProducts.length > 0 && (
            <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full">
              {lowStockProducts.length} Low Stock
            </span>
          )}
        </div>
        <div className="text-3xl font-bold mb-1">{products.length}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Total Products</div>
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
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none transition-colors"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none transition-colors"
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
        {filteredProducts.map((product) => {
          const hasLowStock = product.variants.some((v) => v.stock < 10);
          return (
            <div
              key={product.id}
              className="bg-white dark:bg-white/5 rounded-3xl overflow-hidden border border-gray-200 dark:border-purple-700/20 hover:border-purple-300 dark:hover:border-purple-600/50 transition-all"
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
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 line-clamp-2">{product.name}</h3>

                <div className="space-y-2 mb-4">
                  {product.variants.map((variant) => (
                    <div key={variant.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{variant.size}</span>
                        <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                          Qty: {variant.stock}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                        LKR {variant.price.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingProduct(product)}
                    className="flex-1 px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-xl font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No products found</h3>
          <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          brands={brands}
          onSave={handleSaveProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}

      {showAddModal && (
        <AddProductModal brands={brands} onAdd={handleAddProduct} onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}

interface EditProductModalProps {
  product: Product;
  brands: Brand[];
  onSave: (product: Product) => void;
  onClose: () => void;
}

function EditProductModal({ product, brands, onSave, onClose }: EditProductModalProps) {
  const [formData, setFormData] = useState(product);

  const handleVariantChange = (index: number, field: keyof ProductVariant, value: any) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#1a1425] rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-purple-700/20">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Product</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <ImageUploader
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brand</label>
              <select
                value={formData.brandId ?? ''}
                onChange={(e) => {
                  const selected = brands.find((b) => b.id === Number(e.target.value));
                  setFormData({ ...formData, brandId: selected?.id, brand: selected?.name ?? '' });
                }}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none transition-colors text-gray-900 dark:text-white"
              >
                <option value="">Select a brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none transition-colors"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Badge (Optional)</label>
              <input
                type="text"
                value={formData.badge || ''}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="e.g., Best Seller"
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Variants & Stock</h3>
            <div className="space-y-4">
              {formData.variants.map((variant, index) => (
                <div
                  key={variant.id}
                  className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl"
                >
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Size</label>
                    <input
                      type="text"
                      value={variant.size}
                      onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={variant.price}
                      onChange={(e) => handleVariantChange(index, 'price', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 focus:outline-none text-sm text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Stock</label>
                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(e) => handleVariantChange(index, 'stock', parseInt(e.target.value))}
                      className={`w-full px-3 py-2 rounded-lg border focus:outline-none text-sm ${
                        variant.stock < 10
                          ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700'
                          : 'bg-white dark:bg-white/5 border-gray-200 dark:border-purple-700/20'
                      } focus:border-purple-500`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-purple-700/20">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="flex-1 px-6 py-3 bg-linear-to-r from-purple-600 to-purple-700 text-white rounded-xl font-medium hover:shadow-(--glow-purple-strong) transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

interface AddProductModalProps {
  brands: Brand[];
  onAdd: (product: Product) => void;
  onClose: () => void;
}

function AddProductModal({ brands, onAdd, onClose }: AddProductModalProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    brand: '',
    brandId: undefined,
    category: 'bathroom',
    description: '',
    image: '',
    rating: 4.5,
    reviews: 0,
    badge: '',
    variants: [
      { id: 'var-1', size: '500ml', price: 0, stock: 0 }
    ]
  });

  const handleVariantChange = (index: number, field: 'size' | 'price' | 'stock', value: string | number) => {
    const newVariants = [...(formData.variants || [])];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  const handleSubmit = () => {
    if (formData.name && formData.brandId && formData.variants && formData.variants.length > 0) {
      onAdd(formData as Product);
    } else {
      alert('Please fill in the product name, select a brand, and add at least one variant.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#1a1425] rounded-3xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Product</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Product Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />

          <ImageUploader
            value={formData.image}
            onChange={(url) => setFormData({ ...formData, image: url })}
          />

          <div className="grid grid-cols-2 gap-4">
            <select
              value={formData.brandId ?? ''}
              onChange={(e) => {
                const selected = brands.find((b) => b.id === Number(e.target.value));
                setFormData({ ...formData, brandId: selected?.id, brand: selected?.name ?? '' });
              }}
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 focus:outline-none text-gray-900 dark:text-white"
            >
              <option value="">Select a brand</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>

            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 focus:outline-none text-gray-900 dark:text-white"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <textarea
            placeholder="Product Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />

          <div className="border-t border-gray-200 dark:border-purple-700/20 pt-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Product Variant</h3>
            {formData.variants?.map((variant, index) => (
              <div key={index} className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Size</label>
                  <input
                    type="text"
                    placeholder="e.g., 500ml"
                    value={variant.size}
                    onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 focus:outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Price (LKR)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={variant.price || ''}
                    onChange={(e) => handleVariantChange(index, 'price', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 focus:outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={variant.stock || ''}
                    onChange={(e) => handleVariantChange(index, 'stock', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 focus:outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-6 py-3 bg-linear-to-r from-purple-600 to-purple-700 text-white rounded-xl font-medium hover:shadow-(--glow-purple-strong) transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
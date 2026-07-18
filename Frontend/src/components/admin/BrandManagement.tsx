import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, Save, Tag } from 'lucide-react';
import { productService, Brand } from '../../services/productService';
import ImageUploader from './ImageUploader';
import { validateBrandForm } from '../../utils/productValidation';

export default function BrandManagement() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadBrands = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await productService.adminListBrands();
      setBrands(data);
    } catch (err) {
      setError('Could not load brands.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this brand? This only works if it has no products.')) return;
    try {
      await productService.removeBrand(id);
      await loadBrands();
    } catch (err) {
      alert('Failed to delete brand. It may still have products assigned to it.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Brand Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your product brands and logos</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-linear-to-r from-purple-600 to-purple-700 text-white rounded-xl font-medium hover:shadow-(--glow-purple) transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Brand
        </button>
      </div>

      {isLoading && <div className="text-center py-8 text-gray-500">Loading brands...</div>}
      {error && !isLoading && <div className="text-center py-8 text-red-500">{error}</div>}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20 hover:border-purple-300 dark:hover:border-purple-600/50 transition-all"
            >
              <div className="flex items-center gap-4 mb-4">
                {brand.logo ? (
                  <img src={brand.logo} alt={brand.name} className="w-16 h-16 rounded-xl object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Tag className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{brand.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {brand.products_count ?? 0} product{brand.products_count === 1 ? '' : 's'}
                  </p>
                </div>
              </div>
              {brand.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{brand.description}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingBrand(brand)}
                  className="flex-1 px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-xl font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(brand.id)}
                  className="px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingBrand && (
        <BrandFormModal
          brand={editingBrand}
          onSaved={async () => { await loadBrands(); setEditingBrand(null); }}
          onClose={() => setEditingBrand(null)}
        />
      )}

      {showAddModal && (
        <BrandFormModal
          onSaved={async () => { await loadBrands(); setShowAddModal(false); }}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

interface BrandFormModalProps {
  brand?: Brand;
  onSaved: () => void;
  onClose: () => void;
}

function BrandFormModal({ brand, onSaved, onClose }: BrandFormModalProps) {
  const [name, setName] = useState(brand?.name ?? '');
  const [description, setDescription] = useState(brand?.description ?? '');
  const [logo, setLogo] = useState(brand?.logo ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter a brand name.');
      return;
    }
    setSaving(true);
    try {
      if (brand) {
        await productService.updateBrand(brand.id, { name, description, logo });
      } else {
        await productService.createBrand({ name, description, logo });
      }
      onSaved();
    } catch (err) {
      alert('Failed to save brand. The name may already be in use.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1a1425] rounded-3xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {brand ? 'Edit Brand' : 'Add Brand'}
          </h2>
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
            placeholder="Brand name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 focus:outline-none text-gray-900 dark:text-white"
          />

          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 focus:outline-none text-gray-900 dark:text-white"
          />

          <ImageUploader value={logo} onChange={setLogo} />

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-linear-to-r from-purple-600 to-purple-700 text-white rounded-xl font-medium hover:shadow-(--glow-purple-strong) transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Brand'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from "sonner";
import { MapPin, Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { addressService } from '../../services/addressService';
import type { Address } from '../../types';

const emptyForm = { label: '', street: '', city: '', state: '', zip: '', country: 'Sri Lanka', isDefault: false };

// The address list/add/edit/delete interface, exactly as it was on the old
// standalone My Addresses page -- just without that page's own header/back
// button, so it can be embedded directly inside Settings.
export default function AddressManagement() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadAddresses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await addressService.list();
      setAddresses(data);
    } catch {
      setError('Could not load your addresses.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const openAddModal = () => {
    setEditingAddress(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label,
      street: address.street,
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country,
      isDefault: address.isDefault ?? false,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        label: formData.label,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        country: formData.country,
        is_default: formData.isDefault,
      };

      if (editingAddress) {
        await addressService.update(editingAddress.id, payload as any);
      } else {
        await addressService.create(payload as any);
      }

      await loadAddresses();
      setShowModal(false);
    } catch {
      toast.error('Failed to save address. Please check all fields and try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this address?')) return;
    try {
      await addressService.remove(id);
      await loadAddresses();
    } catch {
      toast.error('Failed to delete address. Please try again.');
    }
  };

  return (
    <>
      {isLoading && <div className="text-center py-16 text-gray-500">Loading addresses...</div>}
      {error && !isLoading && <div className="text-center py-16 text-red-500">{error}</div>}

      {!isLoading && !error && (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="backdrop-blur-xl bg-white/70 dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20 hover:border-purple-300 dark:hover:border-purple-600/50 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{addr.label}</h3>
                    {addr.isDefault && (
                      <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(addr)}
                    className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Edit className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">{addr.street}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{addr.city}, {addr.state} {addr.zip}</div>
            </div>
          ))}

          <button
            onClick={openAddModal}
            className="w-full backdrop-blur-xl bg-white/70 dark:bg-white/5 rounded-3xl p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 transition-all flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add New Address</span>
          </button>
        </div>
      )}

      {showModal && createPortal(
        // Portaled to document.body: this component is embedded inside the
        // "My Address" card in Settings, which has backdrop-blur-xl -- that
        // establishes a new CSS containing block for position:fixed
        // descendants (same root cause as the navbar drawers). Without the
        // portal, "fixed inset-0" here resolved against that card's own box
        // instead of the viewport, clipping the modal so the bottom of the
        // form -- including the Save/Cancel buttons -- rendered off-screen
        // and unreachable.
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          {/* max-h + overflow-y-auto -- belt-and-braces so the form still
              scrolls internally on a short viewport even now that it's
              correctly centered on the full page. */}
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-[#1a1425] rounded-3xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingAddress ? 'Edit Address' : 'Add Address'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Label (e.g. Home, Work)"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 focus:outline-none text-gray-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Street address"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 focus:outline-none text-gray-900 dark:text-white"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 focus:outline-none text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="State/Province"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 focus:outline-none text-gray-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="ZIP/Postal Code"
                  value={formData.zip}
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 focus:outline-none text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 focus:outline-none text-gray-900 dark:text-white"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                />
                Set as default address
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !formData.label || !formData.street || !formData.city}
                  className="flex-1 px-6 py-3 bg-linear-to-r from-purple-600 to-purple-700 text-white rounded-xl font-medium hover:shadow-(--glow-purple-strong) transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

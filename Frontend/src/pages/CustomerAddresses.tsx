import { MapPin, Plus, Edit, Trash2 } from 'lucide-react';
import BackButton from '../components/common/BackButton';

interface CustomerAddressesProps {
  onBack: () => void;
}

export default function CustomerAddresses({ onBack }: CustomerAddressesProps) {
  const addresses = [
    { id: 1, type: 'Home', address: '123 Main Street, Apt 4B', city: 'New York, NY 10001', isDefault: true },
    { id: 2, type: 'Work', address: '456 Business Ave, Suite 200', city: 'New York, NY 10002', isDefault: false }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-[#0f0a1e] dark:via-[#1a1425] dark:to-[#2d1b4e] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton onBack={onBack} />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">My Addresses</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your delivery addresses</p>
        </div>

        {/* Addresses List */}
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="backdrop-blur-xl bg-white/70 dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20 hover:border-purple-300 dark:hover:border-purple-600/50 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{addr.type}</h3>
                    {addr.isDefault && (
                      <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <Edit className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  </button>
                  <button className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">{addr.address}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{addr.city}</div>
            </div>
          ))}

          {/* Add New Address Button */}
          <button className="w-full backdrop-blur-xl bg-white/70 dark:bg-white/5 rounded-3xl p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 transition-all flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400">
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add New Address</span>
          </button>
        </div>
      </div>
    </div>
  );
}

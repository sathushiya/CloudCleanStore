import { useState } from 'react';
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  Settings,
  LogOut,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Menu,
  X,
  ChevronRight,
  Star,
  Edit,
  Trash2,
  Plus,
  Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import DashboardSearchModal from '../components/DashboardSearchModal';
import BackButton from '../components/common/BackButton';

interface DashboardProps {
  onLogout: () => void;
  onBack: () => void;
  activeTab?: TabType;
}

type TabType = 'overview' | 'orders' | 'wishlist' | 'addresses' | 'profile' | 'settings';

export default function Dashboard({ onLogout, onBack, activeTab: initialTab = 'overview' }: DashboardProps) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: User },
    { id: 'orders' as TabType, label: 'My Orders', icon: ShoppingBag },
    { id: 'wishlist' as TabType, label: 'Wishlist', icon: Heart },
    { id: 'addresses' as TabType, label: 'Addresses', icon: MapPin },
    { id: 'profile' as TabType, label: 'Profile', icon: User },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings }
  ];

  // Mock data
  const orders = [
    {
      id: '#ORD-2024-001',
      date: '2026-05-25',
      status: 'delivered',
      total: 156.99,
      items: 5,
      products: [
        { name: 'Multi-Surface Cleaner', quantity: 2, price: 25.98 },
        { name: 'Glass Cleaner', quantity: 1, price: 9.99 }
      ]
    },
    {
      id: '#ORD-2024-002',
      date: '2026-05-20',
      status: 'processing',
      total: 89.50,
      items: 3,
      products: [
        { name: 'Floor Polish', quantity: 1, price: 18.99 }
      ]
    },
    {
      id: '#ORD-2024-003',
      date: '2026-05-15',
      status: 'cancelled',
      total: 45.00,
      items: 2,
      products: []
    }
  ];

  const wishlistItems = [
    {
      id: 1,
      name: 'Premium Bathroom Cleaner',
      brand: 'CleanPro',
      price: 24.99,
      image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=300'
    },
    {
      id: 2,
      name: 'Eco-Friendly Detergent',
      brand: 'GreenClean',
      price: 19.99,
      image: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=300'
    },
    {
      id: 3,
      name: 'Industrial Degreaser',
      brand: 'PowerClean',
      price: 34.99,
      image: 'https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?w=300'
    }
  ];

  const addresses = [
    {
      id: 1,
      type: 'Home',
      name: 'John Doe',
      address: '123 Main Street, Apt 4B',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      phone: '+1 (555) 300-0003',
      isDefault: true
    },
    {
      id: 2,
      type: 'Office',
      name: 'John Doe',
      address: '456 Business Ave, Suite 200',
      city: 'New York',
      state: 'NY',
      zip: '10002',
      phone: '+1 (555) 300-0004',
      isDefault: false
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'processing':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'cancelled':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0a1e]">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#1a1425] border-b border-gray-200 dark:border-purple-700/20 px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Dashboard</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div className="flex pt-16 lg:pt-0">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white dark:bg-[#1a1425] border-r border-gray-200 dark:border-purple-700/20 transform transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="h-full flex flex-col">
            {/* Back Button */}
            <div className="p-4 border-b border-gray-200 dark:border-purple-700/20">
              <BackButton onBack={onBack} />
            </div>

            {/* User Profile */}
            <div className="p-6 border-b border-gray-200 dark:border-purple-700/20">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-linear-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {user?.avatar || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{user?.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      activeTab === tab.id
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </button>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-200 dark:border-purple-700/20">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.name?.split(' ')[0]}!</h1>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">Total</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">12</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Orders</div>
                  </div>

                  <div className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">Completed</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">8</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Delivered</div>
                  </div>

                  <div className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center">
                        <Heart className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">Saved</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{wishlistItems.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Wishlist Items</div>
                  </div>

                  <div className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-xs text-gray-500">Saved</span>
                    </div>
                    <div className="text-2xl font-bold mb-1">{addresses.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Addresses</div>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Orders</h2>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-purple-600 dark:text-purple-400 text-sm font-medium hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-4">
                    {orders.slice(0, 3).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                            {getStatusIcon(order.status)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">{order.id}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(order.date).toLocaleDateString()} • {order.items} items
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900 dark:text-white">${order.total.toFixed(2)}</div>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Orders</h1>

                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{order.id}</h3>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              {order.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Ordered on {new Date(order.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600 dark:text-gray-400">Total Amount</div>
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            ${order.total.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {order.products.length > 0 && (
                        <div className="border-t border-gray-200 dark:border-purple-700/20 pt-4 mt-4">
                          <div className="space-y-2">
                            {order.products.map((product, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">
                                  {product.name} × {product.quantity}
                                </span>
                                <span className="font-medium">LKR {product.price.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3 mt-4">
                        <button className="flex-1 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-xl font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors">
                          View Details
                        </button>
                        {order.status === 'delivered' && (
                          <button className="flex-1 px-4 py-2 border border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300 rounded-xl font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                            Order Again
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Wishlist</h1>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {wishlistItems.length} items
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlistItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-white/5 rounded-3xl overflow-hidden border border-gray-200 dark:border-purple-700/20 hover:shadow-xl transition-shadow"
                    >
                      <div className="relative h-48 bg-gray-100 dark:bg-gray-800">
                        <ImageWithFallback
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        <button className="absolute top-3 right-3 w-10 h-10 bg-white dark:bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                        </button>
                      </div>
                      <div className="p-5">
                        <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">
                          {item.brand}
                        </div>
                        <h3 className="font-semibold mb-3">{item.name}</h3>
                        <div className="flex items-center justify-between">
                          <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                            LKR {item.price.toFixed(2)}
                          </div>
                          <button className="px-4 py-2 bg-linear-to-r from-purple-600 to-purple-700 text-white rounded-xl font-medium hover:shadow-(--glow-purple) transition-all text-sm">
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold">Saved Addresses</h1>
                  <button className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-purple-600 to-purple-700 text-white rounded-xl font-medium hover:shadow-(--glow-purple) transition-all">
                    <Plus className="w-5 h-5" />
                    Add Address
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <h3 className="font-bold">{address.type}</h3>
                            {address.isDefault && (
                              <span className="inline-block px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-600 dark:text-red-400">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <p className="font-medium text-gray-900 dark:text-gray-100">{address.name}</p>
                        <p>{address.address}</p>
                        <p>{address.city}, {address.state} {address.zip}</p>
                        <p>{address.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>

                <div className="bg-white dark:bg-white/5 rounded-3xl p-6 lg:p-8 border border-gray-200 dark:border-purple-700/20">
                  <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                    <div className="w-24 h-24 bg-linear-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                      {user?.avatar || 'U'}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h2 className="text-2xl font-bold mb-1">{user?.name}</h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">{user?.email}</p>
                      <button className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-xl font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors text-sm">
                        Change Avatar
                      </button>
                    </div>
                  </div>

                  <form className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium mb-2">Full Name</label>
                        <input
                          type="text"
                          defaultValue={user?.name}
                          className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Email Address</label>
                        <input
                          type="email"
                          defaultValue={user?.email}
                          className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Phone Number</label>
                        <input
                          type="tel"
                          defaultValue={user?.phone_number}
                          className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Role</label>
                        <input
                          type="text"
                          defaultValue={user?.role}
                          disabled
                          className="w-full px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-purple-700/20 text-gray-500 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        className="px-6 py-3 bg-linear-to-r from-purple-600 to-purple-700 text-white rounded-2xl font-medium hover:shadow-(--glow-purple-strong) transition-all hover:scale-105"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        className="px-6 py-3 bg-gray-100 dark:bg-gray-800 rounded-2xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>

                <div className="bg-white dark:bg-white/5 rounded-3xl p-6 lg:p-8 border border-gray-200 dark:border-purple-700/20">
                  <h2 className="text-xl font-bold mb-6">Account Settings</h2>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                      <div>
                        <h3 className="font-semibold mb-1">Email Notifications</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Receive updates about your orders
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                      <div>
                        <h3 className="font-semibold mb-1">SMS Notifications</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Get text updates on delivery
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                      <div>
                        <h3 className="font-semibold mb-1">Marketing Emails</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Special offers and promotions
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-gray-200 dark:border-purple-700/20">
                    <h3 className="font-bold mb-4 text-red-600 dark:text-red-400">Danger Zone</h3>
                    <button className="px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors border border-red-200 dark:border-red-700/30">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
        />
      )}

      {/* Floating Search Button */}
      <button
        onClick={() => setSearchModalOpen(true)}
        className="fixed bottom-24 right-8 z-50 w-14 h-14 bg-linear-to-br from-purple-600 to-purple-700 text-white rounded-full shadow-lg shadow-purple-500/50 hover:shadow-(--glow-purple-strong) transition-all hover:scale-110 flex items-center justify-center"
        aria-label="Search products"
      >
        <Search className="w-6 h-6" />
      </button>

      {/* Search Modal */}
      {searchModalOpen && (
        <DashboardSearchModal onClose={() => setSearchModalOpen(false)} />
      )}
    </div>
  );
}

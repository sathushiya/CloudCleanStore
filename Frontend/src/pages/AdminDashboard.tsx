import { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  Shield,
  Bell,
  TrendingUp,
  Menu,
  X,
  LogOut,
  Settings,
  Plus,
  Search,
  BarChart3,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  Lock,
  Tag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { staffMembers, deliveryTasks, notifications } from '../data/admin';
import { products } from '../data/products';
import ProductsManagement from '../components/admin/ProductsManagement';
import BrandManagement from '../components/admin/BrandManagement';
import StaffManagement from '../components/admin/StaffManagement';
import OrdersDelivery from '../components/admin/OrdersDelivery';
import PermissionsManagement from '../components/admin/PermissionsManagement';
import NotificationsCenter from '../components/admin/NotificationsCenter';
import PerformanceAnalytics from '../components/admin/PerformanceAnalytics';
import InventoryView from '../components/admin/InventoryView';

interface AdminDashboardProps {
  onLogout: () => void;
}

type TabType = 'overview' | 'inventory' | 'products' | 'brands' | 'staff' | 'orders' | 'permissions' | 'notifications' | 'performance' | 'settings';
export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsList, setNotificationsList] = useState(notifications);

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: LayoutDashboard },
    { id: 'products' as TabType, label: 'Products', icon: Package },
    { id: 'brands' as TabType, label: 'Brands', icon: Tag },
    { id: 'staff' as TabType, label: 'Staff', icon: Users },
    { id: 'orders' as TabType, label: 'Orders & Delivery', icon: Truck },
    { id: 'permissions' as TabType, label: 'Permissions', icon: Shield },
    { id: 'notifications' as TabType, label: 'Notifications', icon: Bell },
    { id: 'performance' as TabType, label: 'Performance', icon: TrendingUp }
  ];

  // Calculate stats
  const totalProducts = products.length;
  const totalStaff = staffMembers.length;
  const activeStaff = staffMembers.filter(s => s.status === 'active').length;
  const pendingOrders = deliveryTasks.filter(t => t.status === 'pending').length;
  const assignedOrders = deliveryTasks.filter(t => t.status === 'assigned' || t.status === 'in_progress').length;
  const unreadNotifications = notifications.filter(n => !n.read).length;
  const lowStockProducts = products.filter(p => p.variants.some(v => v.stock < 10)).length;

  const totalRevenue = deliveryTasks
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.total, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0a1e]">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#1a1425] border-b border-gray-200 dark:border-purple-700/20 px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300"
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
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-purple-700/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white">Admin Panel</h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{user?.name}</p>
                </div>
              </div>
              {/* Settings and Logout at Top */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('settings')}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm text-gray-700 dark:text-gray-300"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-sm text-red-600 dark:text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const hasNotification = tab.id === 'notifications' && unreadNotifications > 0;
                const hasAlert = tab.id === 'products' && lowStockProducts > 0;
                const hasPending = tab.id === 'orders' && pendingOrders > 0;

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                    {hasNotification && (
                      <span className="ml-auto w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadNotifications}
                      </span>
                    )}
                    {hasAlert && (
                      <span className="ml-auto w-6 h-6 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                        {lowStockProducts}
                      </span>
                    )}
                    {hasPending && (
                      <span className="ml-auto w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                        {pendingOrders}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
                    <p className="text-gray-600 dark:text-gray-400">Welcome back, {user?.name}</p>
                  </div>
                </div>

                {/* Stats Grid - Clickable Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <button
                    onClick={() => setActiveTab('inventory')}
                    className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20 hover:border-purple-500 dark:hover:border-purple-500 transition-all cursor-pointer text-left"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      {lowStockProducts > 0 && (
                        <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full">
                          {lowStockProducts} Low Stock
                        </span>
                      )}
                    </div>
                    <div className="text-3xl font-bold mb-1">{totalProducts}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Products</div>
                  </button>

                  <button
                    onClick={() => setActiveTab('staff')}
                    className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20 hover:border-purple-500 dark:hover:border-purple-500 transition-all cursor-pointer text-left"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-xs text-green-600 dark:text-green-400">{activeStaff} Active</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">{totalStaff}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Staff Members</div>
                  </button>

                  <button
                    onClick={() => setActiveTab('orders')}
                    className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20 hover:border-purple-500 dark:hover:border-purple-500 transition-all cursor-pointer text-left"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                        <Truck className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      {pendingOrders > 0 && (
                        <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded-full">
                          {pendingOrders} Pending
                        </span>
                      )}
                    </div>
                    <div className="text-3xl font-bold mb-1">{assignedOrders}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Active Deliveries</div>
                  </button>

                  <div className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-xs text-green-600 dark:text-green-400">+12%</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">${totalRevenue.toFixed(0)}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Revenue (Completed)</div>
                  </div>
                </div>

                {/* Recent Notifications - Max 20 with Mark as Read */}
                <div className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20">
                  <h3 className="text-xl font-bold mb-4">Recent Notifications</h3>
                  <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                    {notificationsList.slice(0, 20).map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-4 rounded-xl border ${
                          notif.read
                            ? 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700'
                            : 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-sm flex-1">{notif.title}</h4>
                          <div className="flex items-center gap-2">
                            {notif.priority === 'high' && (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            )}
                            {!notif.read && (
                              <button
                                onClick={() => {
                                  setNotificationsList(notificationsList.filter(n => n.id !== notif.id));
                                }}
                                className="text-xs px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
                              >
                                Mark as Read
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{notif.message}</p>
                        <div className="text-xs text-gray-500 mt-2">
                          {new Date(notif.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'inventory' && <InventoryView />}

            {activeTab === 'products' && <ProductsManagement />}

            {activeTab === 'brands' && <BrandManagement />}

            {activeTab === 'staff' && <StaffManagement />}

            {activeTab === 'orders' && <OrdersDelivery />}

            {activeTab === 'permissions' && <PermissionsManagement />}

            {activeTab === 'notifications' && <NotificationsCenter />}

            {activeTab === 'performance' && <PerformanceAnalytics />}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Settings</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage your account preferences</p>
                  </div>
                </div>

                {/* Account Information */}
                <div className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-100 dark:bg-purple-900/30">
                      <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    Account Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Full Name</label>
                      <input
                        type="text"
                        defaultValue={user?.name}
                        className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Email Address</label>
                      <input
                        type="email"
                        defaultValue={user?.email}
                        className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        defaultValue="+94 71 234 5678"
                        className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <button className="w-full py-3 bg-linear-to-r from-purple-600 to-purple-700 text-white rounded-2xl font-medium hover:shadow-(--glow-purple-strong) transition-all hover:scale-105">
                      Update Account Information
                    </button>
                  </div>
                </div>

                {/* Change Password */}
                <div className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-100 dark:bg-purple-900/30">
                      <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    Change Password
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Current Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none transition-colors"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none transition-colors"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none transition-colors"
                        placeholder="Confirm new password"
                      />
                    </div>
                    <button className="w-full py-3 bg-linear-to-r from-purple-600 to-purple-700 text-white rounded-2xl font-medium hover:shadow-(--glow-purple-strong) transition-all hover:scale-105">
                      Update Password
                    </button>
                  </div>
                </div>

                {/* Notification Preferences */}
                <div className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-100 dark:bg-purple-900/30">
                      <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    Notification Preferences
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5">
                      <div>
                        <div className="font-medium">Push Notifications</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Receive push notifications for important updates</div>
                      </div>
                      <div className="w-14 h-7 rounded-full bg-purple-600">
                        <div className="w-6 h-6 bg-white rounded-full mt-0.5 ml-7 transition-transform" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5">
                      <div>
                        <div className="font-medium">Email Notifications</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Get email updates about system activities</div>
                      </div>
                      <div className="w-14 h-7 rounded-full bg-purple-600">
                        <div className="w-6 h-6 bg-white rounded-full mt-0.5 ml-7 transition-transform" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5">
                      <div>
                        <div className="font-medium">SMS Alerts</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Receive SMS for critical system alerts</div>
                      </div>
                      <div className="w-14 h-7 rounded-full bg-gray-300 dark:bg-gray-700">
                        <div className="w-6 h-6 bg-white rounded-full mt-0.5 ml-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Preferences */}
                <div className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-100 dark:bg-purple-900/30">
                      <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    System Preferences
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5">
                      <div>
                        <div className="font-medium">Dark Mode</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Enable dark theme</div>
                      </div>
                      <div className="w-14 h-7 rounded-full bg-purple-600">
                        <div className="w-6 h-6 bg-white rounded-full mt-0.5 ml-7 transition-transform" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Language</label>
                      <select className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none transition-colors">
                        <option>English</option>
                        <option>Sinhala</option>
                        <option>Tamil</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Timezone</label>
                      <select className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none transition-colors">
                        <option>Asia/Colombo (UTC+5:30)</option>
                        <option>UTC</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Privacy & Security */}
                <div className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-100 dark:bg-purple-900/30">
                      <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    Privacy & Security
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5">
                      <div>
                        <div className="font-medium">Two-Factor Authentication</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security</div>
                      </div>
                      <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors">
                        Enable
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5">
                      <div>
                        <div className="font-medium">Login History</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">View your recent login activity</div>
                      </div>
                      <button className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors">
                        View
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5">
                      <div>
                        <div className="font-medium">Session Management</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Manage active sessions</div>
                      </div>
                      <button className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors">
                        Manage
                      </button>
                    </div>
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
    </div>
  );
}

import { useEffect, useState, useCallback } from "react";
import {
  Package,
  CheckCircle,
  Clock,
  MapPin,
  LogOut,
  Menu,
  X,
  Settings,
  Bell,
  ShoppingCart,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { orderService, Order, OrderStatus } from "../services/orderService";
import { staffService } from "../services/staffService";
import { profileService } from "../services/profileService";
import DeliveryMap from "../components/staff/DeliveryMap";

interface StaffDashboardProps {
  onLogout: () => void;
}

type TabType = "overview" | "available" | "my-deliveries" | "settings";

const STATUS_FLOW: OrderStatus[] = ["pending", "processing", "out_for_delivery", "delivered"];
const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const POLL_INTERVAL_MS = 8000;

export default function StaffDashboard({ onLogout }: StaffDashboardProps) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<number | null>(null);

  const [isAvailable, setIsAvailable] = useState(true);
  const [togglingAvailability, setTogglingAvailability] = useState(false);

  const [prefsLoading, setPrefsLoading] = useState(true);
  const [notifyPush, setNotifyPush] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      const [pending, all] = await Promise.all([
        orderService.staffList("pending"),
        orderService.staffList(),
      ]);
      setAvailableOrders(pending.filter((o) => !o.assigned_to));
      setMyOrders(
        all.filter(
          (o) => o.assigned_to === user?.id && o.status !== "delivered" && o.status !== "cancelled"
        )
      );
      setError(null);
    } catch (err) {
      setError("Could not load orders.");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadOrders]);

  const loadProfile = async () => {
    setPrefsLoading(true);
    try {
      const profile = await profileService.get();
      setNotifyPush(profile.notify_push ?? true);
      setNotifyEmail(profile.notify_email ?? true);
      setNotifySms(profile.notify_sms ?? false);
      setIsAvailable(profile.is_available ?? true);
    } catch (err) {
      // keep defaults
    } finally {
      setPrefsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const handleToggleAvailability = async () => {
    setTogglingAvailability(true);
    try {
      const result = await staffService.updateAvailability(!isAvailable);
      setIsAvailable(result.is_available);
    } catch (err) {
      alert("Failed to update your availability. Please try again.");
    } finally {
      setTogglingAvailability(false);
    }
  };

  const handleAcceptOrder = async (orderId: number) => {
    setActioningId(orderId);
    try {
      await orderService.assignToSelf(orderId);
      await loadOrders();
    } catch (err) {
      alert("Failed to accept this order -- it may have just been taken by someone else.");
      await loadOrders();
    } finally {
      setActioningId(null);
    }
  };

  const handleAdvanceStatus = async (order: Order) => {
    const currentIndex = STATUS_FLOW.indexOf(order.status);
    const nextStatus = STATUS_FLOW[currentIndex + 1];
    if (!nextStatus) return;

    setActioningId(order.id);
    try {
      await orderService.updateStatus(order.id, nextStatus);
      await loadOrders();
    } catch (err) {
      alert("Failed to update order status. Please try again.");
    } finally {
      setActioningId(null);
    }
  };

  const handleSavePreferences = async () => {
    setSavingPrefs(true);
    try {
      await profileService.updatePreferences({
        notify_push: notifyPush,
        notify_email: notifyEmail,
        notify_sms: notifySms,
      });
      setActiveTab("overview");
    } catch (err) {
      alert("Failed to save settings. Please try again.");
    } finally {
      setSavingPrefs(false);
    }
  };

  const tabs = [
    { id: "overview" as TabType, label: "Overview", icon: Package },
    { id: "available" as TabType, label: "Available Orders", icon: Bell },
    { id: "my-deliveries" as TabType, label: "My Deliveries", icon: ShoppingCart },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0a1e]">
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#1a1425] border-b border-gray-200 dark:border-purple-700/20 px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Staff Dashboard</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div className="flex pt-16 lg:pt-0">
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white dark:bg-[#1a1425] border-r border-gray-200 dark:border-purple-700/20 transform transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-purple-700/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white">{user?.name}</h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {user?.role === "staffsupervisor" ? "Staff Supervisor" : "Staff"}
                  </p>
                </div>
              </div>

              <button
                onClick={handleToggleAvailability}
                disabled={togglingAvailability}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors disabled:opacity-50 ${
                  isAvailable
                    ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/30"
                    : "bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                }`}
              >
                <span className={`text-sm font-medium ${isAvailable ? "text-green-700 dark:text-green-400" : "text-gray-600 dark:text-gray-400"}`}>
                  {togglingAvailability ? "Updating..." : isAvailable ? "Available" : "Offline"}
                </span>
                <div className={`w-11 h-6 rounded-full transition-colors ${isAvailable ? "bg-green-500" : "bg-gray-400"}`}>
                  <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${isAvailable ? "ml-5.5" : "ml-0.5"}`} />
                </div>
              </button>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setActiveTab("settings")}
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

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const badge =
                  tab.id === "available" ? availableOrders.length : tab.id === "my-deliveries" ? myOrders.length : 0;

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                    {badge > 0 && (
                      <span className="ml-auto w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="max-w-5xl mx-auto">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30 rounded-2xl text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name}</h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {isAvailable
                      ? "You're marked as available for new deliveries."
                      : "You're offline -- toggle Available in the sidebar to start receiving orders."}
                  </p>
                </div>

                {isLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button
                      onClick={() => setActiveTab("available")}
                      className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20 hover:border-purple-500 transition-all hover:shadow-lg text-left"
                    >
                      <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mb-4">
                        <Bell className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="text-3xl font-bold mb-1">{availableOrders.length}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Available Orders</div>
                      <div className="text-xs text-purple-600 dark:text-purple-400 mt-2">Click to view →</div>
                    </button>

                    <button
                      onClick={() => setActiveTab("my-deliveries")}
                      className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20 hover:border-purple-500 transition-all hover:shadow-lg text-left"
                    >
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4">
                        <ShoppingCart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="text-3xl font-bold mb-1">{myOrders.length}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">My Active Deliveries</div>
                      <div className="text-xs text-purple-600 dark:text-purple-400 mt-2">Click to view →</div>
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "available" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Available Orders</h1>
                  <p className="text-gray-600 dark:text-gray-400">Unassigned orders ready to be picked up</p>
                </div>

                {isLoading && <div className="text-center py-8 text-gray-500">Loading...</div>}

                {!isLoading && availableOrders.length === 0 ? (
                  <div className="bg-white dark:bg-white/5 rounded-3xl p-12 border border-gray-200 dark:border-purple-700/20 text-center">
                    <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">No orders waiting</h3>
                    <p className="text-gray-600 dark:text-gray-400">New orders will appear here automatically.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {availableOrders.map((order) => (
                      <div key={order.id} className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <span className="font-bold text-lg">{order.order_number}</span>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {new Date(order.created_at).toLocaleString()}
                              </div>
                              <span className="font-semibold text-purple-600 dark:text-purple-400">
                                LKR {order.total.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl flex items-start gap-2">
                          <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400 shrink-0 mt-0.5" />
                          <div className="text-sm text-gray-600 dark:text-gray-400">{order.delivery_address}</div>
                        </div>

                        <button
                          onClick={() => handleAcceptOrder(order.id)}
                          disabled={actioningId === order.id}
                          className="w-full py-3 bg-linear-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:shadow-(--glow-purple-strong) transition-all disabled:opacity-50"
                        >
                          {actioningId === order.id ? "Accepting..." : "Accept Order"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "my-deliveries" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">My Deliveries</h1>
                  <p className="text-gray-600 dark:text-gray-400">Orders currently assigned to you</p>
                </div>

                {isLoading && <div className="text-center py-8 text-gray-500">Loading...</div>}

                {!isLoading && myOrders.length === 0 ? (
                  <div className="bg-white dark:bg-white/5 rounded-3xl p-12 border border-gray-200 dark:border-purple-700/20 text-center">
                    <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">No active deliveries</h3>
                    <p className="text-gray-600 dark:text-gray-400">Accept an order from the Available Orders tab.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {myOrders.map((order) => {
                      const nextStatus = STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1];
                      return (
                        <div key={order.id} className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20 space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="font-bold text-lg">{order.order_number}</span>
                              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {order.user?.name} • LKR {order.total.toFixed(2)}
                              </div>
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                              {STATUS_LABELS[order.status]}
                            </span>
                          </div>

                          <DeliveryMap address={order.delivery_address} />

                          {nextStatus && (
                            <button
                              onClick={() => handleAdvanceStatus(order)}
                              disabled={actioningId === order.id}
                              className="w-full py-3 bg-linear-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:shadow-(--glow-purple-strong) transition-all disabled:opacity-50"
                            >
                              {actioningId === order.id ? "Updating..." : `Mark as ${STATUS_LABELS[nextStatus]}`}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Settings</h1>
                  <p className="text-gray-600 dark:text-gray-400">Manage your account preferences</p>
                </div>

                <div className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <UserIcon className="w-5 h-5" />
                    Profile Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name</label>
                      <input type="text" value={user?.name || ""} readOnly className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input type="email" value={user?.email || ""} readOnly className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Role</label>
                      <input type="text" value={user?.role === "staffsupervisor" ? "Staff Supervisor" : "Staff"} readOnly className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone</label>
                      <input type="tel" value={user?.phone_number || "Not provided"} readOnly className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 cursor-not-allowed" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notification Preferences
                  </h2>
                  {prefsLoading ? (
                    <div className="text-center py-4 text-gray-500">Loading...</div>
                  ) : (
                    <div className="space-y-4">
                      {[
                        { label: "Push Notifications", desc: "New order alerts", value: notifyPush, set: setNotifyPush },
                        { label: "Email Notifications", desc: "Daily delivery summaries", value: notifyEmail, set: setNotifyEmail },
                        { label: "SMS Notifications", desc: "Urgent order alerts", value: notifySms, set: setNotifySms },
                      ].map((pref) => (
                        <div key={pref.label} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                          <div>
                            <div className="font-medium">{pref.label}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{pref.desc}</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={pref.value}
                            onChange={(e) => pref.set(e.target.checked)}
                            className="w-5 h-5 text-purple-600 rounded"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePreferences}
                    disabled={savingPrefs}
                    className="px-6 py-3 bg-linear-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:shadow-(--glow-purple-strong) transition-all font-semibold disabled:opacity-50"
                  >
                    {savingPrefs ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
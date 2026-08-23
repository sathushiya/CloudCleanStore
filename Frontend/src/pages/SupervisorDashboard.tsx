import { useEffect, useState } from "react";
import {
  Package,
  AlertCircle,
  LogOut,
  Settings,
  Menu,
  X,
  Search,
  Edit,
  UserCheck,
  Bell,
  Clock,
  MapPin,
  ShoppingCart,
  CheckCircle,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PhoneVerificationStatus from "../components/common/PhoneVerificationStatus";
import { productService, toFrontendProduct } from "../services/productService";
import type { Product } from "../data/products";
import { orderService, Order } from "../services/orderService";
import { staffService, StaffAccount } from "../services/staffService";
import { profileService } from "../services/profileService";
import notificationService, { AdminNotification } from "../services/notificationService";
import { ImageWithFallback } from "../components/common/ImageWithFallback";

interface SupervisorDashboardProps {
  onLogout: () => void;
}

type TabType =
  | "overview"
  | "inventory-view"
  | "update-inventory"
  | "update-online-inventory"
  | "low-stock"
  | "pending-orders"
  | "payment-confirmations"
  | "settings";

export default function SupervisorDashboard({ onLogout }: SupervisorDashboardProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Real data, replacing every mock source that used to live here
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [paymentSubmissions, setPaymentSubmissions] = useState<Order[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [staffList, setStaffList] = useState<StaffAccount[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [bellOpen, setBellOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [onlineInputValues, setOnlineInputValues] = useState<{ [key: string]: string }>({});
  const [percentSplits, setPercentSplits] = useState<{
    [key: string]: { shop: number; online: number };
  }>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  // Settings state (real preferences, loaded from the server)
  const [prefsLoading, setPrefsLoading] = useState(true);
  const [notifyPush, setNotifyPush] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const loadProducts = async () => {
    setProductsLoading(true);
    try {
      const apiProducts = await productService.staffList();
      setProducts(apiProducts.map(toFrontendProduct));
    } catch {
      // handled by empty-state below
    } finally {
      setProductsLoading(false);
    }
  };

  const loadPendingOrders = async () => {
    setOrdersLoading(true);
    try {
      const data = await orderService.staffList("pending");
      setPendingOrders(data);
    } catch {
      // handled by empty-state below
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadPaymentSubmissions = async () => {
    setPaymentsLoading(true);
    try {
      const data = await orderService.staffList(undefined, "submitted");
      setPaymentSubmissions(data);
    } catch {
      // handled by empty-state below
    } finally {
      setPaymentsLoading(false);
    }
  };

  const loadStaff = async () => {
    try {
      const data = await staffService.list();
      setStaffList(data.filter((s) => s.is_active && (s.role === "staff" || s.role === "staffsupervisor")));
    } catch {
      // dropdown just stays empty
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await notificationService.list();
      setNotifications(data);
    } catch {
      // bell just stays empty
    }
  };

  const handleMarkNotificationRead = async (id: number) => {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      // leave it in the list, user can retry
    }
  };

  const loadPreferences = async () => {
    setPrefsLoading(true);
    try {
      const profile = await profileService.get();
      setNotifyPush(profile.notify_push ?? true);
      setNotifyEmail(profile.notify_email ?? true);
      setNotifySms(profile.notify_sms ?? false);
    } catch {
      // keep defaults
    } finally {
      setPrefsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    loadPendingOrders();
    loadPaymentSubmissions();
    loadStaff();
    loadNotifications();
  }, []);

  useEffect(() => {
    if (activeTab === "settings") loadPreferences();
  }, [activeTab]);

  // onLogout (App.tsx's handler) already calls AuthContext's logout() and
  // navigates -- calling logout() here too fired it twice, racing a second
  // /auth/logout request against already-cleared tokens (stray 401 -> hard
  // window.location redirect on top of the normal navigation).
  const handleLogout = () => {
    onLogout();
  };

  const lowStockProducts = products.filter((p) => p.variants.some((v) => (v.stock ?? 0) < 10));

  // Format stock: "Not set" when the value is genuinely null (never
  // stocked), or the real number (including 0) otherwise -- distinguishes
  // "nobody has set this yet" from "confirmed zero stock".
  const formatStock = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return "Not set";
    return String(value);
  };

  const getPercentSplit = (productId: string, variantId: string) => {
    const key = `${productId}-${variantId}`;
    return percentSplits[key] || { shop: 60, online: 40 };
  };

  const handlePercentChange = (
    productId: string,
    variantId: string,
    type: "shop" | "online",
    value: number,
  ) => {
    const key = `${productId}-${variantId}`;
    const clampedValue = Math.max(0, Math.min(100, value));
    const otherValue = 100 - clampedValue;

    setPercentSplits({
      ...percentSplits,
      [key]: {
        shop: type === "shop" ? clampedValue : otherValue,
        online: type === "online" ? clampedValue : otherValue,
      },
    });
  };

  // Real backend call -- total stock split into shop/online by percentage,
  // sent straight to the same PATCH endpoint Admin's Inventory tab uses.
  const handleTotalStockUpdate = async (
    variantId: string,
    totalStock: number,
    shopPercent: number,
    onlinePercent: number,
  ) => {
    const shopStock = Math.floor(totalStock * (shopPercent / 100));
    const onlineStock = Math.floor(totalStock * (onlinePercent / 100));
    const key = variantId;

    setSavingKey(key);
    try {
      await productService.staffUpdateVariantStock(Number(variantId), {
        shop_stock: shopStock,
        online_stock: onlineStock,
      });
      await loadProducts();
      setInputValues((prev) => ({ ...prev, [variantId]: "" }));
    } catch {
      alert("Failed to update stock. Please try again.");
    } finally {
      setSavingKey(null);
    }
  };

  const handleOnlineStockUpdate = async (variantId: string, onlineStock: number) => {
    setSavingKey(variantId);
    try {
      await productService.staffUpdateVariantStock(Number(variantId), { online_stock: onlineStock });
      await loadProducts();
      setOnlineInputValues((prev) => ({ ...prev, [`${variantId}-online`]: "" }));
    } catch {
      alert("Failed to update online stock. Please try again.");
    } finally {
      setSavingKey(null);
    }
  };

  // Real assignment -- calls the backend, which now accepts an optional
  // staff_id so a supervisor can assign to any staff member, not just self.
  const handleAssignOrder = async (orderId: number, staffId: string) => {
    if (!staffId) return;
    try {
      await orderService.assignToSelf(orderId, Number(staffId));
      await loadPendingOrders();
    } catch {
      alert("Failed to assign order. Please try again.");
    }
  };

  const handleConfirmPayment = async (orderId: number, approved: boolean) => {
    try {
      await orderService.confirmPayment(orderId, approved);
      await loadPaymentSubmissions();
      await loadPendingOrders();
    } catch {
      alert("Failed to update payment status. Please try again.");
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
    } catch {
      alert("Failed to save settings. Please try again.");
    } finally {
      setSavingPrefs(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const tabs = [
    { id: "overview" as TabType, label: "Overview", icon: Package },
    { id: "inventory-view" as TabType, label: "Inventory Management", icon: Package },
    { id: "update-inventory" as TabType, label: "Update Stock", icon: Edit },
    { id: "payment-confirmations" as TabType, label: "Payment Confirmations", icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0a1e]">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#1a1425] border-b border-gray-200 dark:border-purple-700/20 px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Supervisor Dashboard</h1>
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
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-purple-700/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shrink-0">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-gray-900 dark:text-white truncate">Staff Supervisor</h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{user?.name}</p>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setBellOpen((v) => !v)}
                    className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {notifications.length}
                      </span>
                    )}
                  </button>

                  {bellOpen && (
                    <div className="absolute right-0 mt-2 w-80 max-w-[85vw] bg-white dark:bg-[#1a1425] rounded-2xl shadow-2xl border border-gray-200 dark:border-purple-700/20 z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-purple-700/20 font-semibold text-sm">
                        Notifications
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400 text-center">Nothing new.</p>
                        ) : (
                          notifications.map((n) => (
                            <div key={n.id} className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <span className="font-medium text-sm">{n.title}</span>
                                {n.priority === "high" && <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{n.message}</p>
                              <button
                                onClick={() => handleMarkNotificationRead(n.id)}
                                className="text-xs px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
                              >
                                Mark as Read
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
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
                const hasPending = tab.id === "pending-orders" && pendingOrders.length > 0;
                const hasPayments = tab.id === "payment-confirmations" && paymentSubmissions.length > 0;

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (tab.id === "payment-confirmations") loadPaymentSubmissions();
                      if (tab.id === "pending-orders") loadPendingOrders();
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
                    {hasPending && (
                      <span className="ml-auto w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {pendingOrders.length}
                      </span>
                    )}
                    {hasPayments && (
                      <span className="ml-auto w-6 h-6 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                        {paymentSubmissions.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

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
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Overview */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name}</h1>
                  <p className="text-gray-600 dark:text-gray-400">Manage inventory and orders</p>
                </div>

                {(productsLoading || ordersLoading) && (
                  <div className="text-center py-8 text-gray-500">Loading dashboard...</div>
                )}

                {!productsLoading && !ordersLoading && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <button
                      onClick={() => setActiveTab("inventory-view")}
                      className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20 hover:border-purple-500 transition-all hover:shadow-lg text-left"
                    >
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4">
                        <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="text-3xl font-bold mb-1">{products.length}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Products</div>
                      <div className="text-xs text-purple-600 dark:text-purple-400 mt-2">Click to view →</div>
                    </button>

                    <button
                      onClick={() => setActiveTab("low-stock")}
                      className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20 hover:border-orange-500 transition-all hover:shadow-lg text-left"
                    >
                      <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mb-4">
                        <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="text-3xl font-bold mb-1">{lowStockProducts.length}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Low Stock Items</div>
                      <div className="text-xs text-orange-600 dark:text-orange-400 mt-2">Click to view →</div>
                    </button>

                    <button
                      onClick={() => setActiveTab("pending-orders")}
                      className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20 hover:border-red-500 transition-all hover:shadow-lg text-left"
                    >
                      <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mb-4">
                        <Bell className="w-6 h-6 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="text-3xl font-bold mb-1">{pendingOrders.length}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Awaiting Orders</div>
                      <div className="text-xs text-red-600 dark:text-red-400 mt-2">Click to view →</div>
                    </button>
                  </div>
                )}

                <div className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20">
                  <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setActiveTab("update-inventory")}
                      className="p-4 border-2 border-purple-300 dark:border-purple-600 rounded-2xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-left"
                    >
                      <Edit className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
                      <div className="font-semibold">Update Inventory Management</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Update total stock with a shop/online split
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab("update-online-inventory")}
                      className="p-4 border-2 border-purple-300 dark:border-purple-600 rounded-2xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-left"
                    >
                      <ShoppingCart className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
                      <div className="font-semibold">Update Online Inventory Management</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Update online stock quantities independently
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Inventory View (read-only) */}
            {activeTab === "inventory-view" && (
              <div className="space-y-6">
                <TabHeader
                  title="Inventory Management"
                  subtitle="Read-only view of all real inventory"
                  onBack={() => setActiveTab("overview")}
                  onSettings={() => setActiveTab("settings")}
                  onLogout={handleLogout}
                />
                <SearchBar value={searchQuery} onChange={setSearchQuery} />

                {productsLoading && <div className="text-center py-8 text-gray-500">Loading products...</div>}

                <div className="space-y-4">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20">
                      <ProductHeader product={product} />
                      <div className="space-y-3">
                        {product.variants.map((variant) => (
                          <div key={variant.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                            <div className="flex items-center justify-between mb-3">
                              <div className="font-semibold text-lg">{variant.size}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Total Stock: <span className="font-bold text-purple-600 dark:text-purple-400">{formatStock(variant.stock)}</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <StockBox label="Shop Stock" value={variant.shopStock} color="green" />
                              <StockBox label="Online Stock" value={variant.onlineStock} color="blue" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Update Inventory Management */}
            {activeTab === "update-inventory" && (
              <div className="space-y-6">
                <TabHeader
                  title="Update Inventory Management"
                  subtitle="Update total stock with a shop/online percentage split"
                  onBack={() => setActiveTab("overview")}
                  onSettings={() => setActiveTab("settings")}
                  onLogout={handleLogout}
                />
                <SearchBar value={searchQuery} onChange={setSearchQuery} />

                <div className="space-y-4">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20">
                      <ProductHeader product={product} />
                      <div className="space-y-3">
                        {product.variants.map((variant) => {
                          const key = variant.id;
                          const percentSplit = getPercentSplit(product.id, variant.id);
                          const isSaving = savingKey === key;

                          return (
                            <div key={variant.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl space-y-4">
                              <div className="font-semibold mb-1">{variant.size}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Current: {formatStock(variant.stock)} total ({formatStock(variant.shopStock)} shop, {formatStock(variant.onlineStock)} online)
                              </div>

                              <div className="flex items-center gap-3">
                                <label className="text-sm font-medium whitespace-nowrap">Total Quantity:</label>
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="e.g., 100"
                                  value={inputValues[key] || ""}
                                  onChange={(e) => setInputValues({ ...inputValues, [key]: e.target.value })}
                                  className="flex-1 px-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                                />
                                <button
                                  disabled={isSaving}
                                  onClick={() => {
                                    const value = parseInt(inputValues[key]) || 0;
                                    if (value > 0) {
                                      handleTotalStockUpdate(variant.id, value, percentSplit.shop, percentSplit.online);
                                    }
                                  }}
                                  className="px-6 py-2 bg-linear-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-(--glow-purple-strong) transition-all font-semibold whitespace-nowrap disabled:opacity-50"
                                >
                                  {isSaving ? "Saving..." : "Save"}
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                                <PercentSlider
                                  label="Shop Stock %"
                                  color="green"
                                  value={percentSplit.shop}
                                  onChange={(v) => handlePercentChange(product.id, variant.id, "shop", v)}
                                />
                                <PercentSlider
                                  label="Online Stock %"
                                  color="blue"
                                  value={percentSplit.online}
                                  onChange={(v) => handlePercentChange(product.id, variant.id, "online", v)}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Update Online Inventory Management */}
            {activeTab === "update-online-inventory" && (
              <div className="space-y-6">
                <TabHeader
                  title="Update Online Inventory Management"
                  subtitle="Update online stock quantities independently"
                  onBack={() => setActiveTab("overview")}
                  onSettings={() => setActiveTab("settings")}
                  onLogout={handleLogout}
                />
                <SearchBar value={searchQuery} onChange={setSearchQuery} />

                <div className="space-y-4">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20">
                      <ProductHeader product={product} />
                      <div className="space-y-3">
                        {product.variants.map((variant) => {
                          const key = `${variant.id}-online`;
                          const isSaving = savingKey === variant.id;
                          return (
                            <div key={variant.id} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-700/30">
                              <div className="font-semibold mb-2">{variant.size}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                Current Online Stock: {formatStock(variant.onlineStock)}
                              </div>
                              <div className="flex items-center gap-3">
                                <label className="text-sm font-medium whitespace-nowrap">Update Online Stock:</label>
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="e.g., 20"
                                  value={onlineInputValues[key] || ""}
                                  onChange={(e) => setOnlineInputValues({ ...onlineInputValues, [key]: e.target.value })}
                                  className="flex-1 px-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                                />
                                <button
                                  disabled={isSaving}
                                  onClick={() => {
                                    const value = parseInt(onlineInputValues[key]) || 0;
                                    handleOnlineStockUpdate(variant.id, value);
                                  }}
                                  className="px-6 py-2 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg transition-all font-semibold whitespace-nowrap disabled:opacity-50"
                                >
                                  {isSaving ? "Saving..." : "Save"}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Low Stock Items */}
            {activeTab === "low-stock" && (
              <div className="space-y-6">
                <TabHeader
                  title="Low Stock Items"
                  subtitle="Products with quantity less than 10 (or not yet stocked)"
                  onBack={() => setActiveTab("overview")}
                  onSettings={() => setActiveTab("settings")}
                  onLogout={handleLogout}
                />

                <div className="bg-white dark:bg-white/5 rounded-3xl border border-gray-200 dark:border-purple-700/20 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-orange-50 dark:bg-orange-900/20">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Product Name</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Brand</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold">Variant</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold">Stock Level</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {lowStockProducts.map((product) =>
                          product.variants
                            .filter((v) => (v.stock ?? 0) < 10)
                            .map((variant) => (
                              <tr key={`${product.id}-${variant.id}`} className="hover:bg-orange-50 dark:hover:bg-orange-900/10">
                                <td className="px-6 py-4 font-semibold">{product.name}</td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{product.brand}</td>
                                <td className="px-6 py-4 text-center">{variant.size}</td>
                                <td className="px-6 py-4 text-center">
                                  <span className="font-bold text-orange-600 dark:text-orange-400">{formatStock(variant.stock)}</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                                    LOW STOCK
                                  </span>
                                </td>
                              </tr>
                            )),
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {lowStockProducts.length === 0 && !productsLoading && (
                  <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <h3 className="text-xl font-bold mb-2">No Low Stock Items</h3>
                    <p className="text-gray-600 dark:text-gray-400">All products have sufficient stock levels.</p>
                  </div>
                )}
              </div>
            )}

            {/* Awaiting Orders */}
            {activeTab === "pending-orders" && (
              <div className="space-y-6">
                <TabHeader
                  title="Awaiting Orders"
                  subtitle="Manually assign real customer orders to staff members"
                  onBack={() => setActiveTab("overview")}
                  onSettings={() => setActiveTab("settings")}
                  onLogout={handleLogout}
                />

                {ordersLoading && <div className="text-center py-8 text-gray-500">Loading orders...</div>}

                {!ordersLoading && pendingOrders.length === 0 ? (
                  <div className="bg-white dark:bg-white/5 rounded-3xl p-12 border border-gray-200 dark:border-purple-700/20 text-center">
                    <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">All Orders Assigned!</h3>
                    <p className="text-gray-600 dark:text-gray-400">There are no pending orders at the moment.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingOrders.map((order) => (
                      <div key={order.id} className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-bold text-lg">{order.order_number}</span>
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
                                {order.assigned_to ? "Awaiting Acceptance" : "Unassigned"}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {new Date(order.created_at).toLocaleString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <ShoppingCart className="w-4 h-4" />
                                LKR {order.total.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400 shrink-0 mt-0.5" />
                            <div>
                              <div className="font-semibold mb-1">Delivery Address</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">{order.delivery_address}</div>
                              {order.user && (
                                <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">Customer: {order.user.name}</div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="font-semibold">Assign to:</label>
                          <select
                            defaultValue=""
                            onChange={(e) => handleAssignOrder(order.id, e.target.value)}
                            className="flex-1 px-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                          >
                            <option value="">Select staff member...</option>
                            {staffList.map((staff) => (
                              <option key={staff.id} value={staff.id}>
                                {staff.name} — {staff.role === "staffsupervisor" ? "Staff Supervisor" : "Staff"}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Payment Confirmations */}
            {activeTab === "payment-confirmations" && (
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <button onClick={() => setActiveTab("overview")} className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline mb-3">
                      ← Back to Overview
                    </button>
                    <h1 className="text-3xl font-bold mb-2">Payment Confirmations</h1>
                    <p className="text-gray-600 dark:text-gray-400">Review and confirm real bank transfer submissions</p>
                  </div>
                  <button
                    onClick={loadPaymentSubmissions}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors text-sm font-medium"
                  >
                    Refresh
                  </button>
                </div>

                {paymentsLoading && <div className="text-center py-8 text-gray-500">Loading...</div>}

                {!paymentsLoading && paymentSubmissions.length === 0 ? (
                  <div className="bg-white dark:bg-white/5 rounded-3xl p-12 border border-gray-200 dark:border-purple-700/20 text-center">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">All Caught Up!</h3>
                    <p className="text-gray-500 dark:text-gray-400">No pending payment confirmations at the moment.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paymentSubmissions.map((order) => (
                      <div key={order.id} className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg">{order.order_number}</span>
                              <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs rounded-full font-medium">
                                Awaiting Confirmation
                              </span>
                            </div>
                            {order.user && (
                              <div className="text-sm text-gray-600 dark:text-gray-400">Customer: {order.user.name}</div>
                            )}
                            {order.payment_reference && (
                              <div className="text-sm text-gray-500 dark:text-gray-500">Reference: {order.payment_reference}</div>
                            )}
                            <div className="text-purple-600 dark:text-purple-400 font-bold">LKR {order.total.toFixed(2)}</div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleConfirmPayment(order.id, true)}
                              className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-green-500 to-green-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all hover:scale-105"
                            >
                              <CheckCircle className="w-5 h-5" />
                              Confirm
                            </button>
                            <button
                              onClick={() => handleConfirmPayment(order.id, false)}
                              className="flex items-center gap-2 px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settings */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <button onClick={() => setActiveTab("overview")} className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline mb-3">
                      ← Back to Overview
                    </button>
                    <h1 className="text-3xl font-bold mb-2">Settings</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage your supervisor account settings</p>
                  </div>
                  <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors">
                    <LogOut className="w-5 h-5" />
                    <span className="hidden sm:inline font-medium">Logout</span>
                  </button>
                </div>

                <div className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <UserCheck className="w-5 h-5" />
                    Profile Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ReadonlyField label="Full Name" value={user?.name || ""} />
                    <ReadonlyField label="Email" value={user?.email || ""} />
                    <ReadonlyField label="Role" value="Staff Supervisor" />
                  </div>
                </div>

                <div className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Phone &amp; WhatsApp
                  </h2>
                  <PhoneVerificationStatus />
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
                      <PrefToggle
                        title="Push Notifications"
                        description="Receive push notifications for orders and stock alerts"
                        checked={notifyPush}
                        onChange={setNotifyPush}
                      />
                      <PrefToggle
                        title="Email Notifications"
                        description="Get notified by email for important updates"
                        checked={notifyEmail}
                        onChange={setNotifyEmail}
                      />
                      <PrefToggle
                        title="SMS Notifications"
                        description="Get urgent alerts via SMS"
                        checked={notifySms}
                        onChange={setNotifySms}
                      />
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

// ─── Small shared pieces ────────────────────────────────────────────────────

function TabHeader({
  title,
  subtitle,
  onBack,
  onSettings,
  onLogout,
}: {
  title: string;
  subtitle: string;
  onBack: () => void;
  onSettings: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <button onClick={onBack} className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline mb-3">
          ← Back to Overview
        </button>
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onSettings} className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Settings">
          <Settings className="w-5 h-5" />
          <span className="hidden sm:inline font-medium">Settings</span>
        </button>
        <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors" title="Logout">
          <LogOut className="w-5 h-5" />
          <span className="hidden sm:inline font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}

function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search products..."
        className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 focus:outline-none transition-colors"
      />
    </div>
  );
}

function ProductHeader({ product }: { product: Product }) {
  return (
    <div className="flex items-start gap-4 mb-4">
      <ImageWithFallback src={product.image} alt={product.name} className="w-20 h-20 rounded-2xl object-cover" />
      <div className="flex-1">
        <h3 className="font-bold text-lg mb-1">{product.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{product.brand}</p>
      </div>
    </div>
  );
}

function StockBox({ label, value, color }: { label: string; value: number | null | undefined; color: "green" | "blue" }) {
  const display = value === null || value === undefined ? "Not set" : String(value);
  const classes =
    color === "green"
      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700/30 text-green-600 dark:text-green-400"
      : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700/30 text-blue-600 dark:text-blue-400";
  return (
    <div className={`p-3 border rounded-lg ${classes}`}>
      <div className="text-xs font-medium mb-1">{label}</div>
      <div className="text-2xl font-bold">{display}</div>
    </div>
  );
}

function PercentSlider({
  label,
  color,
  value,
  onChange,
}: {
  label: string;
  color: "green" | "blue";
  value: number;
  onChange: (v: number) => void;
}) {
  const labelColor = color === "green" ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400";
  return (
    <div className="space-y-2">
      <label className={`text-sm font-medium ${labelColor}`}>{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          className="w-20 px-3 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-center"
        />
        <span className="text-sm">%</span>
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="flex-1"
        />
      </div>
    </div>
  );
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <input
        type="text"
        value={value}
        readOnly
        className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 cursor-not-allowed"
      />
    </div>
  );
}

function PrefToggle({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">{description}</div>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 text-purple-600 rounded"
      />
    </div>
  );
}

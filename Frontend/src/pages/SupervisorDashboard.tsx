import { useState } from "react";
import {
  Package,
  Users,
  AlertCircle,
  LogOut,
  Settings,
  Menu,
  X,
  Plus,
  Minus,
  Search,
  Edit,
  Save,
  UserCheck,
  Bell,
  Clock,
  MapPin,
  ShoppingCart,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { products as initialProducts, Product } from "../data/products";
import {
  deliveryTasks as initialTasks,
  DeliveryTask,
  staffMembers,
  StaffMember,
} from "../data/admin";
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

export default function SupervisorDashboard({
  onLogout,
}: SupervisorDashboardProps) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [tasks, setTasks] = useState<DeliveryTask[]>(initialTasks);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockAdjustment, setStockAdjustment] = useState<{
    [key: string]: number;
  }>({});
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [onlineInputValues, setOnlineInputValues] = useState<{
    [key: string]: string;
  }>({});
  const [percentSplits, setPercentSplits] = useState<{
    [key: string]: { shop: number; online: number };
  }>({});
  const [pendingPayments, setPendingPayments] = useState<any[]>(() => {
    const stored = JSON.parse(localStorage.getItem("pendingPayments") || "[]");
    if (stored.length === 0) {
      // Demo entry so the tab is never empty on first load
      const demo = [
        {
          orderId: "ORD-DEMO001",
          total: 3450.0,
          customerName: "Amal Perera",
          address: "45 Galle Road, Colombo 03",
          products: [
            { name: "Surface Cleaner 500ml", quantity: 2 },
            { name: "Floor Polish", quantity: 1 },
          ],
          deliveryTime: "express",
          submittedAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem("pendingPayments", JSON.stringify(demo));
      return demo;
    }
    return stored;
  });

  const refreshPendingPayments = () => {
    const stored = JSON.parse(localStorage.getItem("pendingPayments") || "[]");
    setPendingPayments(stored);
  };

  const handleConfirmPayment = (orderId: string) => {
    // Signal customer's waiting page
    const confirmations = JSON.parse(
      localStorage.getItem("paymentConfirmations") || "{}",
    );
    confirmations[orderId] = "confirmed";
    localStorage.setItem("paymentConfirmations", JSON.stringify(confirmations));

    // Build a DeliveryTask and push to staff queue
    const payment = pendingPayments.find((p) => p.orderId === orderId) as any;
    if (payment) {
      const newTask: DeliveryTask = {
        id: `task-${Date.now()}`,
        orderId: payment.orderId,
        customerName: payment.customerName || "Customer",
        address: payment.address || "N/A",
        customerAddress: payment.address || "N/A",
        customerDistrict: "Colombo",
        shopDistrict: "Colombo",
        products: payment.products || [],
        total: payment.total,
        status: "pending",
        assignedTo: null,
        assignedAt: null,
        completedAt: null,
        declinedBy: [],
        priority: "medium",
        deliveryTime: payment.deliveryTime || "standard",
        estimatedTime:
          payment.deliveryTime === "express" ? "30-45 min" : "60-90 min",
        createdAt: new Date().toISOString(),
      };
      // Push to localStorage so StaffDashboard picks it up
      const existing = JSON.parse(
        localStorage.getItem("newDeliveryTasks") || "[]",
      );
      existing.push(newTask);
      localStorage.setItem("newDeliveryTasks", JSON.stringify(existing));
      // Also add to supervisor's own task list (Awaiting Orders tab)
      setTasks((prev) => [...prev, newTask]);
    }

    const updated = pendingPayments.filter((p) => p.orderId !== orderId);
    localStorage.setItem("pendingPayments", JSON.stringify(updated));
    setPendingPayments(updated);
  };

  const handleLogout = () => {
    logout();
    onLogout();
  };

  // Filter pending orders (no staff assigned or assigned but not accepted)
  const pendingOrders = tasks.filter(
    (t) => t.status === "pending" || t.status === "assigned",
  );

  // Get low stock products (any variant with stock < 10)
  const lowStockProducts = products.filter((p) =>
    p.variants.some((v) => (v.stock || 0) < 10),
  );

  // Initialize stock split (60% shop, 40% online) if not set
  const initializeStockSplit = () => {
    setProducts(
      products.map((product) => ({
        ...product,
        variants: product.variants.map((variant) => ({
          ...variant,
          shopStock: variant.shopStock ?? Math.floor(variant.stock * 0.6),
          onlineStock: variant.onlineStock ?? Math.floor(variant.stock * 0.4),
        })),
      })),
    );
  };

  // Update total stock with dynamic percentage split
  const handleTotalStockUpdate = (
    productId: string,
    variantId: string,
    totalStock: number,
    shopPercent: number,
    onlinePercent: number,
  ) => {
    const shopStock = Math.floor(totalStock * (shopPercent / 100));
    const onlineStock = Math.floor(totalStock * (onlinePercent / 100));

    setProducts(
      products.map((product) => {
        if (product.id === productId) {
          return {
            ...product,
            variants: product.variants.map((variant) => {
              if (variant.id === variantId) {
                return {
                  ...variant,
                  stock: totalStock,
                  shopStock,
                  onlineStock,
                };
              }
              return variant;
            }),
          };
        }
        return product;
      }),
    );

    // Clear input after update
    const key = `${productId}-${variantId}`;
    setInputValues({ ...inputValues, [key]: "" });
  };

  // Get percentage split for a variant (default 60/40)
  const getPercentSplit = (productId: string, variantId: string) => {
    const key = `${productId}-${variantId}`;
    return percentSplits[key] || { shop: 60, online: 40 };
  };

  // Format stock value: "-" for non-existent, "0" for null, or actual value
  const formatStock = (value: number | null | undefined): string | number => {
    if (value === null || value === undefined) {
      return 0;
    }
    return value;
  };

  // Format variant stock: "-" if variant doesn't exist, "0" if null, or actual value
  const formatVariantStock = (variant: any | undefined): string | number => {
    if (!variant) {
      return "-";
    }
    return formatStock(variant.stock);
  };

  // Update percentage split (auto-adjust the other percentage)
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

  // Update only online stock
  const handleOnlineStockUpdate = (
    productId: string,
    variantId: string,
    onlineStock: number,
  ) => {
    setProducts(
      products.map((product) => {
        if (product.id === productId) {
          return {
            ...product,
            variants: product.variants.map((variant) => {
              if (variant.id === variantId) {
                const shopStock = variant.shopStock ?? 0;
                return {
                  ...variant,
                  onlineStock,
                  stock: shopStock + onlineStock,
                };
              }
              return variant;
            }),
          };
        }
        return product;
      }),
    );

    // Clear input after update
    const key = `${productId}-${variantId}-online`;
    setOnlineInputValues({ ...onlineInputValues, [key]: "" });
  };

  // Manual Order Assignment
  const handleAssignOrder = (taskId: string, staffId: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            assignedTo: staffId,
            status: "assigned" as const,
            assignedAt: new Date().toISOString(),
            manuallyAssignedBySupervisor: true,
          };
        }
        return task;
      }),
    );
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const tabs = [
    { id: "overview" as TabType, label: "Overview", icon: Package },
    {
      id: "inventory-view" as TabType,
      label: "Inventory Management",
      icon: Package,
    },
    { id: "update-inventory" as TabType, label: "Update Stock", icon: Edit },
    {
      id: "payment-confirmations" as TabType,
      label: "Payment Confirmations",
      icon: CheckCircle,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0a1e]">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#1a1425] border-b border-gray-200 dark:border-purple-700/20 px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Supervisor Dashboard
          </h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
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
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-purple-700/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white">
                    Staff Supervisor
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {user?.name}
                  </p>
                </div>
              </div>
              {/* Settings and Logout at Top */}
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

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const hasPending =
                  tab.id === "pending-orders" && pendingOrders.length > 0;
                const hasPayments =
                  tab.id === "payment-confirmations" &&
                  pendingPayments.length > 0;

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (tab.id === "payment-confirmations")
                        refreshPendingPayments();
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
                        {pendingPayments.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Footer */}
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
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">
                      Welcome, {user?.name}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      Manage inventory and orders
                    </p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <button
                    onClick={() => setActiveTab("inventory-view")}
                    className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20 hover:border-purple-500 dark:hover:border-purple-500 transition-all hover:shadow-lg text-left"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold mb-1">
                      {products.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total Products
                    </div>
                    <div className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                      Click to view →
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab("low-stock")}
                    className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20 hover:border-orange-500 dark:hover:border-orange-500 transition-all hover:shadow-lg text-left"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold mb-1">
                      {lowStockProducts.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Low Stock Items
                    </div>
                    <div className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                      Click to view →
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab("pending-orders")}
                    className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20 hover:border-red-500 dark:hover:border-red-500 transition-all hover:shadow-lg text-left"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                        <Bell className="w-6 h-6 text-red-600 dark:text-red-400" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold mb-1">
                      {pendingOrders.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Awaiting Orders
                    </div>
                    <div className="text-xs text-red-600 dark:text-red-400 mt-2">
                      Click to view →
                    </div>
                  </button>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20">
                  <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setActiveTab("update-inventory")}
                      className="p-4 border-2 border-purple-300 dark:border-purple-600 rounded-2xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-left"
                    >
                      <Edit className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
                      <div className="font-semibold">
                        Update Inventory Management
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Update total stock with auto-split (60% Shop, 40%
                        Online)
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab("update-online-inventory")}
                      className="p-4 border-2 border-purple-300 dark:border-purple-600 rounded-2xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-left"
                    >
                      <ShoppingCart className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
                      <div className="font-semibold">
                        Update Online Inventory Management
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Update online stock quantities independently
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Inventory View Tab (Read-Only) */}
            {activeTab === "inventory-view" && (
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <button
                      onClick={() => setActiveTab("overview")}
                      className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline mb-3"
                    >
                      ← Back to Overview
                    </button>
                    <h1 className="text-3xl font-bold mb-2">
                      Inventory Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      Read-only view of all inventory
                    </p>
                  </div>

                  {/* Top Right Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab("settings")}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      title="Settings"
                    >
                      <Settings className="w-5 h-5" />
                      <span className="hidden sm:inline font-medium">
                        Settings
                      </span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                      title="Logout"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="hidden sm:inline font-medium">
                        Logout
                      </span>
                    </button>
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Products List - Mirroring Update Inventory Layout */}
                <div className="space-y-4">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <ImageWithFallback
                          src={product.image}
                          alt={product.name}
                          className="w-20 h-20 rounded-2xl object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {product.brand}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {product.variants.map((variant) => {
                          const stockValue = variant.stock ?? 0;
                          const shopStock =
                            variant.shopStock ?? Math.floor(stockValue * 0.6);
                          const onlineStock =
                            variant.onlineStock ?? Math.floor(stockValue * 0.4);

                          return (
                            <div
                              key={variant.id}
                              className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl"
                            >
                              {/* Size and Total Stock */}
                              <div className="flex items-center justify-between mb-3">
                                <div className="font-semibold text-lg">
                                  {variant.size}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  Total Stock:{" "}
                                  <span className="font-bold text-purple-600 dark:text-purple-400">
                                    {formatStock(variant.stock)}
                                  </span>
                                </div>
                              </div>

                              {/* Stock Distribution Grid */}
                              <div className="grid grid-cols-2 gap-4">
                                {/* Shop Stock */}
                                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/30 rounded-lg">
                                  <div className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">
                                    Shop Stock
                                  </div>
                                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {shopStock}
                                  </div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    {stockValue > 0
                                      ? Math.round(
                                          (shopStock / stockValue) * 100,
                                        )
                                      : 0}
                                    % of total
                                  </div>
                                </div>

                                {/* Online Stock */}
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/30 rounded-lg">
                                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                                    Online Stock
                                  </div>
                                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {onlineStock}
                                  </div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    {stockValue > 0
                                      ? Math.round(
                                          (onlineStock / stockValue) * 100,
                                        )
                                      : 0}
                                    % of total
                                  </div>
                                </div>
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

            {/* Update Inventory Management Tab */}
            {activeTab === "update-inventory" && (
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <button
                      onClick={() => setActiveTab("overview")}
                      className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline mb-3"
                    >
                      ← Back to Overview
                    </button>
                    <h1 className="text-3xl font-bold mb-2">
                      Update Inventory Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      Update total stock with dynamic percentage allocation
                    </p>
                  </div>

                  {/* Top Right Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab("settings")}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      title="Settings"
                    >
                      <Settings className="w-5 h-5" />
                      <span className="hidden sm:inline font-medium">
                        Settings
                      </span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                      title="Logout"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="hidden sm:inline font-medium">
                        Logout
                      </span>
                    </button>
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Products List */}
                <div className="space-y-4">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <ImageWithFallback
                          src={product.image}
                          alt={product.name}
                          className="w-20 h-20 rounded-2xl object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {product.brand}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {product.variants.map((variant) => {
                          const stockValue = variant.stock ?? 0;
                          const shopStock =
                            variant.shopStock ?? Math.floor(stockValue * 0.6);
                          const onlineStock =
                            variant.onlineStock ?? Math.floor(stockValue * 0.4);
                          const key = `${product.id}-${variant.id}`;
                          const percentSplit = getPercentSplit(
                            product.id,
                            variant.id,
                          );

                          return (
                            <div
                              key={variant.id}
                              className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl space-y-4"
                            >
                              {/* Current Stock Display */}
                              <div className="flex items-center gap-4">
                                <div className="flex-1">
                                  <div className="font-semibold mb-2">
                                    {variant.size}
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Current: {formatStock(variant.stock)} total
                                    ({shopStock} shop, {onlineStock} online)
                                  </div>
                                </div>
                              </div>

                              {/* Quantity Input with Add Button */}
                              <div className="flex items-center gap-3">
                                <label className="text-sm font-medium whitespace-nowrap">
                                  Total Quantity:
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="e.g., 100"
                                  value={inputValues[key] || ""}
                                  onChange={(e) =>
                                    setInputValues({
                                      ...inputValues,
                                      [key]: e.target.value,
                                    })
                                  }
                                  className="flex-1 px-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                                />
                                <button
                                  onClick={() => {
                                    const value =
                                      parseInt(inputValues[key]) || 0;
                                    if (value > 0) {
                                      handleTotalStockUpdate(
                                        product.id,
                                        variant.id,
                                        value,
                                        percentSplit.shop,
                                        percentSplit.online,
                                      );
                                    }
                                  }}
                                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-[var(--glow-purple-strong)] transition-all font-semibold whitespace-nowrap"
                                >
                                  Add
                                </button>
                              </div>

                              {/* Dynamic Percentage Allocation */}
                              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                                {/* Shop Percentage */}
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-green-600 dark:text-green-400">
                                    Shop Stock %
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={percentSplit.shop}
                                      onChange={(e) =>
                                        handlePercentChange(
                                          product.id,
                                          variant.id,
                                          "shop",
                                          parseInt(e.target.value) || 0,
                                        )
                                      }
                                      className="w-20 px-3 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-center"
                                    />
                                    <span className="text-sm">%</span>
                                    <input
                                      type="range"
                                      min="0"
                                      max="100"
                                      value={percentSplit.shop}
                                      onChange={(e) =>
                                        handlePercentChange(
                                          product.id,
                                          variant.id,
                                          "shop",
                                          parseInt(e.target.value),
                                        )
                                      }
                                      className="flex-1"
                                    />
                                  </div>
                                </div>

                                {/* Online Percentage */}
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                    Online Stock %
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={percentSplit.online}
                                      onChange={(e) =>
                                        handlePercentChange(
                                          product.id,
                                          variant.id,
                                          "online",
                                          parseInt(e.target.value) || 0,
                                        )
                                      }
                                      className="w-20 px-3 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-center"
                                    />
                                    <span className="text-sm">%</span>
                                    <input
                                      type="range"
                                      min="0"
                                      max="100"
                                      value={percentSplit.online}
                                      onChange={(e) =>
                                        handlePercentChange(
                                          product.id,
                                          variant.id,
                                          "online",
                                          parseInt(e.target.value),
                                        )
                                      }
                                      className="flex-1"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Preview Calculation */}
                              {inputValues[key] &&
                                parseInt(inputValues[key]) > 0 && (
                                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700/30 rounded-lg p-3">
                                    <div className="text-sm font-semibold mb-2 text-purple-700 dark:text-purple-300">
                                      Preview Distribution:
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 text-sm">
                                      <div>
                                        <div className="text-gray-600 dark:text-gray-400">
                                          Total
                                        </div>
                                        <div className="font-bold">
                                          {inputValues[key]}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-green-600 dark:text-green-400">
                                          Shop ({percentSplit.shop}%)
                                        </div>
                                        <div className="font-bold text-green-600 dark:text-green-400">
                                          {Math.floor(
                                            parseInt(inputValues[key]) *
                                              (percentSplit.shop / 100),
                                          )}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-blue-600 dark:text-blue-400">
                                          Online ({percentSplit.online}%)
                                        </div>
                                        <div className="font-bold text-blue-600 dark:text-blue-400">
                                          {Math.floor(
                                            parseInt(inputValues[key]) *
                                              (percentSplit.online / 100),
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Update Online Inventory Management Tab */}
            {activeTab === "update-online-inventory" && (
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <button
                      onClick={() => setActiveTab("overview")}
                      className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline mb-3"
                    >
                      ← Back to Overview
                    </button>
                    <h1 className="text-3xl font-bold mb-2">
                      Update Online Inventory Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      Update online stock quantities independently
                    </p>
                  </div>

                  {/* Top Right Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab("settings")}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      title="Settings"
                    >
                      <Settings className="w-5 h-5" />
                      <span className="hidden sm:inline font-medium">
                        Settings
                      </span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                      title="Logout"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="hidden sm:inline font-medium">
                        Logout
                      </span>
                    </button>
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-purple-700/20 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Products List */}
                <div className="space-y-4">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <ImageWithFallback
                          src={product.image}
                          alt={product.name}
                          className="w-20 h-20 rounded-2xl object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {product.brand}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {product.variants.map((variant) => {
                          const stockValue = variant.stock ?? 0;
                          const onlineStock =
                            variant.onlineStock ?? Math.floor(stockValue * 0.4);
                          const key = `${product.id}-${variant.id}-online`;
                          const currentOnlineStock =
                            variant.onlineStock ?? onlineStock;

                          return (
                            <div
                              key={variant.id}
                              className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-700/30"
                            >
                              <div className="flex items-center gap-4 mb-3">
                                <div className="flex-1">
                                  <div className="font-semibold mb-2">
                                    {variant.size}
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Current Online Stock:{" "}
                                    {formatStock(currentOnlineStock)}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <label className="text-sm font-medium whitespace-nowrap">
                                  Update Online Stock:
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  placeholder={`e.g., ${Math.max(currentOnlineStock + 10, 20)}`}
                                  value={onlineInputValues[key] || ""}
                                  onChange={(e) =>
                                    setOnlineInputValues({
                                      ...onlineInputValues,
                                      [key]: e.target.value,
                                    })
                                  }
                                  className="flex-1 px-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                                />
                                <button
                                  onClick={() => {
                                    const value =
                                      parseInt(onlineInputValues[key]) || 0;
                                    if (value >= 0) {
                                      handleOnlineStockUpdate(
                                        product.id,
                                        variant.id,
                                        value,
                                      );
                                    }
                                  }}
                                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-[var(--glow-blue-strong)] transition-all font-semibold whitespace-nowrap"
                                >
                                  Add
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

            {/* Low Stock Items Tab */}
            {activeTab === "low-stock" && (
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <button
                      onClick={() => setActiveTab("overview")}
                      className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline mb-3"
                    >
                      ← Back to Overview
                    </button>
                    <h1 className="text-3xl font-bold mb-2">Low Stock Items</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      Products with quantity less than 10
                    </p>
                  </div>

                  {/* Top Right Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab("settings")}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      title="Settings"
                    >
                      <Settings className="w-5 h-5" />
                      <span className="hidden sm:inline font-medium">
                        Settings
                      </span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                      title="Logout"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="hidden sm:inline font-medium">
                        Logout
                      </span>
                    </button>
                  </div>
                </div>

                {/* Low Stock Table */}
                <div className="bg-white dark:bg-white/5 rounded-3xl border border-gray-200 dark:border-purple-700/20 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-orange-50 dark:bg-orange-900/20">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold">
                            Product Name
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">
                            Brand
                          </th>
                          <th className="px-6 py-4 text-center text-sm font-semibold">
                            Variant
                          </th>
                          <th className="px-6 py-4 text-center text-sm font-semibold">
                            Stock Level
                          </th>
                          <th className="px-6 py-4 text-center text-sm font-semibold">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {lowStockProducts.map((product) =>
                          product.variants
                            .filter((v) => (v.stock ?? 0) < 10)
                            .map((variant) => (
                              <tr
                                key={`${product.id}-${variant.id}`}
                                className="hover:bg-orange-50 dark:hover:bg-orange-900/10"
                              >
                                <td className="px-6 py-4 font-semibold">
                                  {product.name}
                                </td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                  {product.brand}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  {variant.size}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span className="font-bold text-orange-600 dark:text-orange-400">
                                    {formatStock(variant.stock)}
                                  </span>
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

                {lowStockProducts.length === 0 && (
                  <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <h3 className="text-xl font-bold mb-2">
                      No Low Stock Items
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      All products have sufficient stock levels.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Awaiting Orders Tab */}
            {activeTab === "pending-orders" && (
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <button
                      onClick={() => setActiveTab("overview")}
                      className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline mb-3"
                    >
                      ← Back to Overview
                    </button>
                    <h1 className="text-3xl font-bold mb-2">Awaiting Orders</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      Manually assign orders to staff members
                    </p>
                  </div>

                  {/* Top Right Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab("settings")}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      title="Settings"
                    >
                      <Settings className="w-5 h-5" />
                      <span className="hidden sm:inline font-medium">
                        Settings
                      </span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                      title="Logout"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="hidden sm:inline font-medium">
                        Logout
                      </span>
                    </button>
                  </div>
                </div>

                {pendingOrders.length === 0 ? (
                  <div className="bg-white dark:bg-white/5 rounded-3xl p-12 border border-gray-200 dark:border-purple-700/20 text-center">
                    <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">
                      All Orders Assigned!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      There are no pending orders at the moment.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingOrders.map((task) => (
                      <div
                        key={task.id}
                        className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-bold text-lg">
                                Order #{task.orderId}
                              </span>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  task.status === "pending"
                                    ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                                    : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                }`}
                              >
                                {task.status === "pending"
                                  ? "Unassigned"
                                  : "Awaiting Acceptance"}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {new Date(task.createdAt).toLocaleString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <ShoppingCart className="w-4 h-4" />
                                LKR {task.total.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="font-semibold mb-1">
                                Delivery Address
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {task.customerAddress}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="font-semibold">Assign to:</label>
                          <select
                            value={task.assignedTo || ""}
                            onChange={(e) =>
                              handleAssignOrder(task.id, e.target.value)
                            }
                            className="flex-1 px-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                          >
                            <option value="">Select staff member...</option>
                            {staffMembers
                              .filter(
                                (s) =>
                                  s.status === "active" && s.role === "staff",
                              )
                              .map((staff) => (
                                <option key={staff.id} value={staff.id}>
                                  {staff.name} - {staff.role}
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

            {/* Payment Confirmations Tab */}
            {activeTab === "payment-confirmations" && (
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <button
                      onClick={() => setActiveTab("overview")}
                      className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline mb-3"
                    >
                      ← Back to Overview
                    </button>
                    <h1 className="text-3xl font-bold mb-2">
                      Payment Confirmations
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      Review and confirm online banking payments from customers
                    </p>
                  </div>
                  <button
                    onClick={refreshPendingPayments}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors text-sm font-medium"
                  >
                    Refresh
                  </button>
                </div>

                {pendingPayments.length === 0 ? (
                  <div className="bg-white dark:bg-white/5 rounded-3xl p-12 border border-gray-200 dark:border-purple-700/20 text-center">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">All Caught Up!</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      No pending payment confirmations at the moment.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingPayments.map((payment) => (
                      <div
                        key={payment.orderId}
                        className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg">
                                {payment.orderId}
                              </span>
                              <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs rounded-full font-medium">
                                Awaiting Confirmation
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Submitted:{" "}
                              {new Date(payment.submittedAt).toLocaleString()}
                            </div>
                            <div className="text-purple-600 dark:text-purple-400 font-bold">
                              LKR {payment.total.toFixed(2)}
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              handleConfirmPayment(payment.orderId)
                            }
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all hover:scale-105"
                          >
                            <CheckCircle className="w-5 h-5" />
                            Confirm Payment
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <button
                      onClick={() => setActiveTab("overview")}
                      className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline mb-3"
                    >
                      ← Back to Overview
                    </button>
                    <h1 className="text-3xl font-bold mb-2">Settings</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      Manage your supervisor account settings
                    </p>
                  </div>

                  {/* Top Right Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                      title="Logout"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="hidden sm:inline font-medium">
                        Logout
                      </span>
                    </button>
                  </div>
                </div>

                {/* Settings Sections */}
                <div className="space-y-6">
                  {/* Profile Information */}
                  <div className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <UserCheck className="w-5 h-5" />
                      Profile Information
                    </h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={user?.name || ""}
                            readOnly
                            className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            value={user?.email || ""}
                            readOnly
                            className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Role
                          </label>
                          <input
                            type="text"
                            value="Staff Supervisor"
                            readOnly
                            className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Phone
                          </label>
                          <input
                            type="tel"
                            value={user?.phone || "Not provided"}
                            readOnly
                            className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notifications Settings */}
                  <div className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Notification Preferences
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <div>
                          <div className="font-medium">Low Stock Alerts</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Get notified when product stock falls below 10 units
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-5 h-5 text-purple-600 rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <div>
                          <div className="font-medium">
                            New Order Notifications
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Receive alerts for new pending orders
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-5 h-5 text-purple-600 rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <div>
                          <div className="font-medium">
                            Staff Assignment Updates
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Get notified when staff accept or decline tasks
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-5 h-5 text-purple-600 rounded"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Inventory Thresholds */}
                  <div className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Inventory Thresholds
                    </h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Low Stock Warning Level
                          </label>
                          <input
                            type="number"
                            defaultValue="10"
                            min="1"
                            className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                          />
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Alert when stock falls below this number
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Critical Stock Level
                          </label>
                          <input
                            type="number"
                            defaultValue="5"
                            min="1"
                            className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                          />
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Urgent alert threshold
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Display Preferences */}
                  <div className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-200 dark:border-purple-700/20">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Display Preferences
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Items Per Page
                        </label>
                        <select
                          defaultValue="25"
                          className="w-full md:w-64 px-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                        >
                          <option value="10">10 items</option>
                          <option value="25">25 items</option>
                          <option value="50">50 items</option>
                          <option value="100">100 items</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <div>
                          <div className="font-medium">Show Product Images</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Display product images in inventory lists
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-5 h-5 text-purple-600 rounded"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setActiveTab("overview")}
                      className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        alert("Settings saved successfully!");
                        setActiveTab("overview");
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:shadow-[var(--glow-purple-strong)] transition-all font-semibold"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

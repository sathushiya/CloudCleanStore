import { useEffect, useRef } from "react";
import { Truck, X } from "lucide-react";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { useNavigation } from "./hooks/useNavigation";
import orderService from "./services/orderService";
import type { PageType } from "./types";
import { useState } from "react";

// Layout
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// Common
import ThemeToggle from "./components/common/ThemeToggle";

// Page sections
import Hero from "./components/Hero";
import Categories from "./components/Categories";
import Products from "./components/Products";
import Brands from "./components/Brands";
import Features from "./components/Features";
import CartModal from "./components/CartModal";

// Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import AdminDashboard from "./pages/AdminDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import Shop from "./pages/Shop";
import Checkout from "./pages/Checkout";
import CustomerOrders from "./pages/CustomerOrders";
import CustomerAddresses from "./pages/CustomerAddresses";
import CustomerSettings from "./pages/CustomerSettings";
import CustomerWishlist from "./pages/CustomerWishlist";
import CustomerActivity from "./pages/CustomerActivity";
import Legal from "./pages/Legal";

// Guests can browse (Shop, product pages) freely, but order-related pages
// require an account. Redirect to login rather than silently failing on
// 401s from the cart/order API once they get there. Hoisted out of the
// component so it's a stable reference (a fresh array literal on every
// render would defeat the point of listing it as an effect dependency).
const GUEST_BLOCKED_PAGES: PageType[] = ["checkout", "orders", "addresses", "wishlist"];

function AppContent() {
  const { isAuthenticated, user, isLoading, logout } = useAuth();
  const { currentPage, navigate, goBack, reset } = useNavigation("home");
  const [cartModalOpen, setCartModalOpen] = useState(false);

  // Auto-redirect staff/admin/staffsupervisor roles to their dashboard right
  // after login. Deliberately keyed on [isAuthenticated, user] only -- this
  // fires once on the auth transition, not on every visit to "home" while
  // already authenticated, so staff can navigate back to "home" afterwards
  // without being bounced away again. currentPage/navigate are intentionally
  // left out of the dependency array for that reason.
  useEffect(() => {
    if (isAuthenticated && currentPage === "home") {
      if (user?.role === "admin") navigate("admin");
      else if (user?.role === "staffsupervisor") navigate("staffsupervisor");
      else if (user?.role === "staff") navigate("staff");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && GUEST_BLOCKED_PAGES.includes(currentPage)) {
      navigate("login");
    }
  }, [isAuthenticated, isLoading, currentPage, navigate]);

  // Watches the customer's own orders for the moment one goes out for
  // delivery, wherever they are in the app -- redirects to the landing
  // page with a toast rather than requiring them to be sitting on My
  // Orders to notice. Polls rather than pushing since there's no
  // websocket/SSE layer here.
  const [deliveryToast, setDeliveryToast] = useState<string | null>(null);
  const lastKnownStatuses = useRef<Map<number, string> | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "customer") {
      lastKnownStatuses.current = null;
      return;
    }

    let cancelled = false;

    const checkForDispatch = async () => {
      try {
        const orders = await orderService.myOrders();
        if (cancelled) return;

        if (lastKnownStatuses.current === null) {
          // First check this session -- just record where things stand.
          // Don't toast for an order that was already out for delivery
          // before the app loaded.
          lastKnownStatuses.current = new Map(orders.map((o) => [o.id, o.status]));
          return;
        }

        for (const order of orders) {
          const previousStatus = lastKnownStatuses.current.get(order.id);
          if (previousStatus && previousStatus !== "out_for_delivery" && order.status === "out_for_delivery") {
            setDeliveryToast(`Your order ${order.order_number} is out for delivery!`);
            reset("home");
          }
          lastKnownStatuses.current.set(order.id, order.status);
        }
      } catch {
        // Transient network error -- just try again on the next tick.
      }
    };

    checkForDispatch();
    const interval = setInterval(checkForDispatch, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isAuthenticated, user?.role, reset]);

  useEffect(() => {
    if (!deliveryToast) return;
    const timer = setTimeout(() => setDeliveryToast(null), 6000);
    return () => clearTimeout(timer);
  }, [deliveryToast]);

  const handleLoginSuccess = () => {
    if (user?.role === "admin") navigate("admin");
    else if (user?.role === "staffsupervisor") navigate("staffsupervisor");
    else if (user?.role === "staff") navigate("staff");
    else reset("home");
  };

  const handleLogout = async () => {
    await logout();
    reset("login");
  };

  const handleNavigateToShop = () => {
    navigate("shop");
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
  };

  const handleCategoryClick = (categoryId: string) => {
    sessionStorage.setItem("selectedCategory", categoryId);
    handleNavigateToShop();
  };

  const navProps = {
    onNavigateToLogin: () => navigate("login"),
    onNavigateToShop: handleNavigateToShop,
    onOpenCart: () => setCartModalOpen(true),
    onLogout: handleLogout,
    onNavigateToOrders: () => navigate("orders"),
    onNavigateToAddresses: () => navigate("addresses"),
    onNavigateToSettings: () => navigate("settings"),
    onNavigateToWishlist: () => navigate("wishlist"),
    onNavigateToActivity: () => navigate("activity"),
  };

  // ── Auth pages ──────────────────────────────────────────────────────────────
  if (currentPage === "login")
    return (
      <>
        <Login
          onNavigateToSignup={() => navigate("signup")}
          onLoginSuccess={handleLoginSuccess}
          onBack={goBack}
          onNavigateToForgotPassword={() => navigate("forgotPassword")}
        />
        <ThemeToggle />
      </>
    );
  if (currentPage === "signup")
    return (
      <>
        <Signup
          onNavigateToLogin={() => navigate("login")}
          onSignupSuccess={() => reset("home")}
          onBack={goBack}
        />
        <ThemeToggle />
      </>
    );
  if (currentPage === "forgotPassword")
    return (
      <>
        <ForgotPassword
          onBack={goBack}
          onNavigateToLogin={() => navigate("login")}
        />
        <ThemeToggle />
      </>
    );

  // ── Dashboard pages ─────────────────────────────────────────────────────────
  if (currentPage === "admin" && isAuthenticated && user?.role === "admin")
    return (
      <>
        <AdminDashboard onLogout={handleLogout} />
        <ThemeToggle />
      </>
    );
  if (
    currentPage === "staffsupervisor" &&
    isAuthenticated &&
    user?.role === "staffsupervisor"
  )
    return (
      <>
        <SupervisorDashboard onLogout={handleLogout} />
        <ThemeToggle />
      </>
    );
  if (currentPage === "staff" && isAuthenticated && user?.role === "staff")
    return (
      <>
        <StaffDashboard onLogout={handleLogout} />
        <ThemeToggle />
      </>
    );

  // ── Customer pages ──────────────────────────────────────────────────────────
  if (currentPage === "checkout" && isAuthenticated)
    return (
      <>
        <Checkout
          onBack={goBack}
          onOrderPlaced={() => {
            reset("home");
            setCartModalOpen(false);
          }}
        />
        <ThemeToggle />
      </>
    );
  if (currentPage === "orders" && isAuthenticated)
    return (
      <>
        <CustomerOrders onBack={goBack} />
        <ThemeToggle />
      </>
    );
  if (currentPage === "addresses" && isAuthenticated)
    return (
      <>
        <CustomerAddresses onBack={goBack} />
        <ThemeToggle />
      </>
    );
  if (currentPage === "settings" && isAuthenticated)
    return (
      <>
        <CustomerSettings onBack={goBack} />
        <ThemeToggle />
      </>
    );
  if (currentPage === "wishlist" && isAuthenticated)
    return (
      <>
        <CustomerWishlist onBack={goBack} />
        <ThemeToggle />
      </>
    );
  if (currentPage === "activity" && isAuthenticated)
    return (
      <>
        <CustomerActivity onBack={goBack} />
        <ThemeToggle />
      </>
    );

  // ── Legal pages -- open to guests too, unlike the customer pages above ──────
  if (currentPage === "privacy" || currentPage === "terms" || currentPage === "cookies")
    return (
      <>
        <Legal page={currentPage} onBack={goBack} />
        <ThemeToggle />
      </>
    );

  // ── Shop page ───────────────────────────────────────────────────────────────
  if (currentPage === "shop")
    return (
      <div className="min-h-screen">
        <Navbar {...navProps} />
        <div className="pt-20">
          <Shop onBack={goBack} onRequireLogin={() => navigate("login")} />
        </div>
        <Footer onNavigateToLegal={(page) => navigate(page)} />
        <ThemeToggle />
        {cartModalOpen && (
          <CartModal
            onClose={() => setCartModalOpen(false)}
            onCheckout={() => navigate("checkout")}
          />
        )}
      </div>
    );

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-purple-50 dark:bg-[#0f0a1e]"
        style={{
          backgroundImage:
            "linear-gradient(to bottom right, rgb(250 245 255), rgb(255 255 255), rgb(243 232 255))",
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-purple-600 dark:text-purple-300 font-medium">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // ── Home page ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen">
      <Navbar {...navProps} />
      <Hero
        onNavigateToShop={handleNavigateToShop}
      />
      <Categories
        onCategoryClick={handleCategoryClick}
      />
      <Products
        onNavigateToLogin={() => navigate("login")}
        onNavigateToShop={handleNavigateToShop}
        isAuthenticated={isAuthenticated}
      />
      <Brands onNavigateToShop={handleNavigateToShop} />
      <Features />
      <Footer onNavigateToLegal={(page) => navigate(page)} />
      <ThemeToggle />
      {cartModalOpen && (
        <CartModal
          onClose={() => setCartModalOpen(false)}
          onCheckout={() => navigate("checkout")}
        />
      )}
      {deliveryToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-100 w-full max-w-sm px-4">
          <div className="bg-linear-to-r from-purple-600 to-purple-700 text-white rounded-2xl shadow-2xl p-4 flex items-start gap-3 transition-all duration-300">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <p className="flex-1 text-sm font-medium pt-2">{deliveryToast}</p>
            <button
              onClick={() => setDeliveryToast(null)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        {/* Renders every toast.* call app-wide (replaces raw browser alert()
            popups -- see commit that introduced this for the full list of
            call sites that used to block the page with a native dialog). */}
        <Toaster position="top-right" richColors closeButton />
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

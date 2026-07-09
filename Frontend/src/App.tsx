import { useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { useNavigation } from "./hooks/useNavigation";
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

function AppContent() {
  const { isAuthenticated, user, isLoading, logout } = useAuth();
  const { currentPage, navigate, goBack, reset } = useNavigation("home");
  const [cartModalOpen, setCartModalOpen] = useState(false);

  // Auto-redirect staff/admin/staffsupervisor roles on login
  useEffect(() => {
    if (isAuthenticated && currentPage === "home") {
      if (user?.role === "admin") navigate("admin");
      else if (user?.role === "staffsupervisor") navigate("staffsupervisor");
      else if (user?.role === "staff") navigate("staff");
    }
  }, [isAuthenticated, user]);

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
  if (currentPage === "checkout")
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

  // ── Shop page ───────────────────────────────────────────────────────────────
  if (currentPage === "shop")
    return (
      <div className="min-h-screen">
        <Navbar {...navProps} />
        <div className="pt-20">
          <Shop onBack={goBack} />
        </div>
        <Footer />
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-[#0f0a1e] dark:via-[#1a1425] dark:to-[#2d1b4e]">
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
        onNavigateToLogin={() => navigate("login")}
        onNavigateToShop={handleNavigateToShop}
        isAuthenticated={isAuthenticated}
      />
      <Categories
        onCategoryClick={handleCategoryClick}
        onNavigateToSignup={() => navigate("signup")}
        isAuthenticated={isAuthenticated}
      />
      <Products
        onNavigateToLogin={() => navigate("login")}
        onNavigateToShop={handleNavigateToShop}
        isAuthenticated={isAuthenticated}
      />
      <Brands />
      <Features />
      <Footer />
      <ThemeToggle />
      {cartModalOpen && (
        <CartModal
          onClose={() => setCartModalOpen(false)}
          onCheckout={() => navigate("checkout")}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

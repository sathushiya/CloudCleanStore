import { useState } from 'react';
import { Menu, X, ShoppingCart, User, Search, Settings, LogOut, Camera, Heart, MapPin, Package, Clock, Bell } from 'lucide-react';
import Logo from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

interface NavbarProps {
  onNavigateToLogin?: () => void;
  onNavigateToShop?: () => void;
  onOpenCart?: () => void;
  onLogout?: () => void;
  onNavigateToOrders?: () => void;
  onNavigateToAddresses?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToWishlist?: () => void;
  onNavigateToActivity?: () => void;
}

export default function Navbar({ onNavigateToLogin, onNavigateToShop, onOpenCart, onLogout, onNavigateToOrders, onNavigateToAddresses, onNavigateToSettings, onNavigateToWishlist, onNavigateToActivity }: NavbarProps = {}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  // Mock notification count - can be replaced with real data later
  const notificationCount = 3;

  const scrollToProducts = () => {
    const productsSection = document.getElementById('products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToFooter = () => {
    const footerSection = document.getElementById('footer');
    if (footerSection) {
      footerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout(); // Call the auth logout function
    onLogout?.(); // Call the navigation callback
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-[var(--glass-bg)] border-b border-[var(--glass-border)] shadow-[var(--glass-shadow)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Hamburger Menu Button - Left Side */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-[var(--accent)] transition-colors text-gray-900 dark:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo - Center */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Logo className="h-10" />
          </div>

          {/* Actions - Right Side */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {isAuthenticated && (
              <>
                <button onClick={onNavigateToShop} className="p-2 hover:bg-[var(--accent)] rounded-full transition-colors">
                  <Search className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setNotificationModalOpen(true)}
                  className="p-2 hover:bg-[var(--accent)] rounded-full transition-colors relative"
                >
                  <Bell className="w-5 h-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1">
                      {notificationCount}
                    </span>
                  )}
                </button>
                <button onClick={onOpenCart} className="p-2 hover:bg-[var(--accent)] rounded-full transition-colors relative">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-[var(--primary)] text-white text-xs rounded-full flex items-center justify-center px-1">
                      {cartCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setProfileModalOpen(true)}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[var(--primary)] text-white rounded-full hover:opacity-90 transition-all hover:shadow-[var(--glow-purple)]"
                >
                  <User className="w-4 h-4" />
                  {user?.name?.split(' ')[0] || 'Profile'}
                </button>
              </>
            )}
            {!isAuthenticated && (
              <button
                onClick={onNavigateToLogin}
                className="px-4 py-2 text-sm font-medium bg-[var(--primary)] text-white rounded-full hover:opacity-90 transition-all hover:shadow-[var(--glow-purple)]"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 60% Dark Overlay Background - Covers entire page */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[9998] animate-fadeIn"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Left Slide-out Sidebar Menu - On top of overlay - Fully Opaque */}
      <div className={`fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-[#6b21a8] shadow-2xl z-[9999] transform transition-transform duration-300 ease-out ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full bg-[#6b21a8]">
          {/* Sidebar Header with Logo and Close X Button */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-purple-700 flex-shrink-0 bg-[#6b21a8]">
            <Logo className="h-8" />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-10 h-10 bg-purple-800 hover:bg-purple-700 rounded-lg flex items-center justify-center transition-colors text-white flex-shrink-0"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Sidebar Navigation Content - Vertical Auto Layout, All Items Visible */}
          <div className="flex-1 px-5 py-4 flex flex-col bg-[#6b21a8]">
            <nav className="flex flex-col gap-1 flex-shrink-0 bg-[#6b21a8]">
              {/* Show different menu based on authentication status */}
              {!isAuthenticated ? (
                <>
                  {/* Main Navigation Items - For Non-Authenticated Users */}
                  <a
                    href="#home"
                    className="flex-shrink-0 block px-4 py-2.5 text-base text-gray-100 hover:text-white hover:bg-purple-800 rounded-lg transition-all font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </a>
                  <button
                    onClick={() => {
                      scrollToProducts();
                      setMobileMenuOpen(false);
                    }}
                    className="flex-shrink-0 w-full text-left block px-4 py-2.5 text-base text-gray-100 hover:text-white hover:bg-purple-800 rounded-lg transition-all font-medium"
                  >
                    Shop
                  </button>
                  <a
                    href="#brands"
                    className="flex-shrink-0 block px-4 py-2.5 text-base text-gray-100 hover:text-white hover:bg-purple-800 rounded-lg transition-all font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Brands
                  </a>
                  <button
                    onClick={() => {
                      scrollToFooter();
                      setMobileMenuOpen(false);
                    }}
                    className="flex-shrink-0 w-full text-left block px-4 py-2.5 text-base text-gray-100 hover:text-white hover:bg-purple-800 rounded-lg transition-all font-medium"
                  >
                    Contact Us
                  </button>
                </>
              ) : (
                <>
                  {/* Customer Dashboard Options - Only for Authenticated Users */}
                  <button
                    onClick={() => {
                      onNavigateToActivity?.();
                      setMobileMenuOpen(false);
                    }}
                    className="flex-shrink-0 w-full flex items-center gap-2.5 px-4 py-2.5 text-base text-gray-100 hover:text-white hover:bg-purple-800 rounded-lg transition-all font-medium"
                  >
                    <Clock className="w-5 h-5 flex-shrink-0" />
                    <span>My Activity</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigateToOrders?.();
                      setMobileMenuOpen(false);
                    }}
                    className="flex-shrink-0 w-full flex items-center gap-2.5 px-4 py-2.5 text-base text-gray-100 hover:text-white hover:bg-purple-800 rounded-lg transition-all font-medium"
                  >
                    <Package className="w-5 h-5 flex-shrink-0" />
                    <span>My Orders</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigateToAddresses?.();
                      setMobileMenuOpen(false);
                    }}
                    className="flex-shrink-0 w-full flex items-center gap-2.5 px-4 py-2.5 text-base text-gray-100 hover:text-white hover:bg-purple-800 rounded-lg transition-all font-medium"
                  >
                    <MapPin className="w-5 h-5 flex-shrink-0" />
                    <span>My Addresses</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigateToSettings?.();
                      setMobileMenuOpen(false);
                    }}
                    className="flex-shrink-0 w-full flex items-center gap-2.5 px-4 py-2.5 text-base text-gray-100 hover:text-white hover:bg-purple-800 rounded-lg transition-all font-medium"
                  >
                    <Settings className="w-5 h-5 flex-shrink-0" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigateToWishlist?.();
                      setMobileMenuOpen(false);
                    }}
                    className="flex-shrink-0 w-full flex items-center gap-2.5 px-4 py-2.5 text-base text-gray-100 hover:text-white hover:bg-purple-800 rounded-lg transition-all font-medium"
                  >
                    <Heart className="w-5 h-5 flex-shrink-0" />
                    <span>Wishlist</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-shrink-0 w-full flex items-center gap-2.5 px-4 py-2.5 text-base text-red-300 hover:text-red-100 hover:bg-red-900 rounded-lg transition-all font-medium"
                  >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    <span>Logout</span>
                  </button>
                </>
              )}

              {/* Sign In Button - Only for Non-Authenticated Users */}
              {!isAuthenticated && (
                <div className="flex-shrink-0 pt-2 mt-2 border-t border-purple-700 bg-[#6b21a8]">
                  <button
                    onClick={() => {
                      onNavigateToLogin?.();
                      setMobileMenuOpen(false);
                    }}
                    className="flex-shrink-0 w-full px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-medium transition-all"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </nav>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>

      {/* Notification Drawer - Right Side */}
      {notificationModalOpen && (
        <>
          {/* Dark Overlay - Covers Entire Page */}
          <div
            className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen bg-black/70 z-[9998] animate-fadeIn"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
            onClick={() => setNotificationModalOpen(false)}
          />

          {/* Notification Drawer */}
          <div
            className={`fixed top-0 right-0 bottom-0 w-96 max-w-[90vw] z-[9999] shadow-2xl transform transition-transform duration-300 ease-out ${
              notificationModalOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
            style={{ backgroundColor: '#1e1147' }}
          >
            <div className="h-full flex flex-col p-6" style={{ backgroundColor: '#1e1147' }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Notifications</h2>
                <button
                  onClick={() => setNotificationModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto space-y-3">
                {/* Notification Item 1 */}
                <div className="bg-white/10 rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-colors cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-sm mb-1">Order Shipped</h3>
                      <p className="text-white/60 text-xs mb-2">Your order #ORD-2024-003 has been shipped and is on its way!</p>
                      <p className="text-white/40 text-xs">2 hours ago</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-2"></div>
                  </div>
                </div>

                {/* Notification Item 2 */}
                <div className="bg-white/10 rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-colors cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-sm mb-1">Wishlist Item on Sale</h3>
                      <p className="text-white/60 text-xs mb-2">Premium Floor Polish is now 20% off! Get it before the sale ends.</p>
                      <p className="text-white/40 text-xs">5 hours ago</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-2"></div>
                  </div>
                </div>

                {/* Notification Item 3 */}
                <div className="bg-white/10 rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-colors cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <Bell className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-sm mb-1">New Products Available</h3>
                      <p className="text-white/60 text-xs mb-2">Check out our latest eco-friendly cleaning products!</p>
                      <p className="text-white/40 text-xs">1 day ago</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-2"></div>
                  </div>
                </div>

                {/* Empty State - Hidden when there are notifications */}
                {/* <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Bell className="w-16 h-16 text-white/20 mb-4" />
                  <h3 className="text-white font-semibold text-lg mb-2">No Notifications</h3>
                  <p className="text-white/60 text-sm">You're all caught up!</p>
                </div> */}
              </div>

              {/* Footer Action */}
              <div className="mt-6 pt-4 border-t border-white/20">
                <button
                  onClick={() => {
                    console.log('Mark all as read');
                    setNotificationModalOpen(false);
                  }}
                  className="w-full px-6 py-3 rounded-lg bg-white text-purple-900 font-semibold hover:bg-gray-100 transition-colors"
                >
                  Mark All as Read
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Profile Drawer - Right Side */}
      {profileModalOpen && (
        <>
          {/* Dark Overlay - Covers Entire Page */}
          <div
            className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen bg-black/70 z-[9998] animate-fadeIn"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
            onClick={() => setProfileModalOpen(false)}
          />

          {/* Profile Drawer */}
          <div
            className={`fixed top-0 right-0 bottom-0 w-96 max-w-[90vw] z-[9999] shadow-2xl transform transition-transform duration-300 ease-out ${
              profileModalOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
            style={{ backgroundColor: '#1e1147' }}
          >
            <div className="h-full flex flex-col p-6" style={{ backgroundColor: '#1e1147' }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">My Profile</h2>
                <button
                  onClick={() => setProfileModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Profile Avatar */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white text-4xl font-bold border-4 border-white/20">
                    {user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                  </div>
                  <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center text-purple-600 shadow-lg hover:bg-gray-100 transition-colors">
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-white/60 text-sm mt-3">Click to change photo</p>
              </div>

              {/* Form Fields */}
              <div className="flex-1 flex flex-col gap-5">
                <div>
                  <label className="block text-white font-semibold mb-2">Full Name</label>
                  <input
                    type="text"
                    defaultValue={user?.name || ''}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue={user?.email || ''}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Phone Number</label>
                  <input
                    type="tel"
                    defaultValue={user?.phone || ''}
                    placeholder="Enter your phone number"
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setProfileModalOpen(false)}
                  className="flex-1 px-6 py-3 rounded-lg bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log('Profile saved');
                    setProfileModalOpen(false);
                  }}
                  className="flex-1 px-6 py-3 rounded-lg bg-white text-purple-900 font-semibold hover:bg-gray-100 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}

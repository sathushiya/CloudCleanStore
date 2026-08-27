import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X, ShoppingCart, User, Settings, LogOut, Camera, Heart, MapPin, Package, Clock, Bell, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import Logo from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import orderService, { Order, OrderStatus } from '../../services/orderService';
import profileService from '../../services/profileService';

const ORDER_STATUS_COPY: Record<OrderStatus, { title: string; message: (n: string) => string; icon: typeof Package }> = {
  pending: { title: 'Order Received', message: (n) => `Order ${n} is waiting to be processed.`, icon: Clock },
  processing: { title: 'Order Processing', message: (n) => `Order ${n} is being prepared.`, icon: Package },
  out_for_delivery: { title: 'Out for Delivery', message: (n) => `Order ${n} is on its way!`, icon: Truck },
  delivered: { title: 'Order Delivered', message: (n) => `Order ${n} has been delivered.`, icon: CheckCircle },
  cancelled: { title: 'Order Cancelled', message: (n) => `Order ${n} was cancelled.`, icon: AlertCircle },
};

const formatRelativeTime = (isoDate: string): string => {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(isoDate).toLocaleDateString();
};

interface NavbarProps {
  onNavigateToLogin?: () => void;
  onOpenCart?: () => void;
  onLogout?: () => void;
  onNavigateToAddresses?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToWishlist?: () => void;
  onNavigateToActivity?: () => void;
}

export default function Navbar({ onNavigateToLogin, onOpenCart, onLogout, onNavigateToAddresses, onNavigateToSettings, onNavigateToWishlist, onNavigateToActivity }: NavbarProps = {}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const { isAuthenticated, user, refreshUser } = useAuth();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  // Real notifications, derived from the customer's own orders -- not a
  // separate stored notification, just their live order status.
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  // Keyed by `${order.id}:${order.status}`, not just order.id -- otherwise
  // reading an order's notification once (e.g. while it's "processing")
  // would permanently suppress the unread badge for that order, even after
  // staff advances it to "out for delivery" or "delivered" later.
  const [readKeys, setReadKeys] = useState<Set<string>>(new Set());

  const ORDER_POLL_INTERVAL_MS = 15000;

  useEffect(() => {
    // Only customers ever own orders through this endpoint -- staff/admin/
    // staffsupervisor briefly render this home layout before App.tsx's
    // auto-redirect effect sends them to their own dashboard, and would
    // otherwise fire a guaranteed-403 request (and its poll) on every login.
    if (!isAuthenticated || user?.role !== 'customer') return;

    let cancelled = false;
    const loadOrders = () => {
      orderService.myOrders()
        .then((data) => { if (!cancelled) setOrders(data); })
        .catch(() => {})
        .finally(() => { if (!cancelled) setOrdersLoaded(true); });
    };

    loadOrders();
    const interval = setInterval(loadOrders, ORDER_POLL_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(interval); };
  }, [isAuthenticated, user?.role]);

  const orderNotifications = orders
    .filter((o) => o.status !== 'cancelled')
    .slice(0, 10);
  const readKeyFor = (order: Order) => `${order.id}:${order.status}`;
  const unreadCount = orderNotifications.filter((o) => !readKeys.has(readKeyFor(o))).length;

  const handleMarkAllRead = () => {
    setReadKeys((prev) => {
      const next = new Set(prev);
      orderNotifications.forEach((o) => next.add(readKeyFor(o)));
      return next;
    });
  };

  // Profile drawer -- name is the only field the backend lets a user edit
  // themselves; email/phone stay read-only here (phone goes through the
  // WhatsApp re-verification flow in Settings, not a plain text edit).
  const [profileName, setProfileName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    setProfileName(user?.name || '');
  }, [user?.name]);

  const handleSaveProfile = async () => {
    if (!profileName.trim()) return;
    setSavingProfile(true);
    setProfileSaved(false);
    try {
      await profileService.update(profileName.trim());
      await refreshUser();
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch {
      // form stays open so the user can retry
    } finally {
      setSavingProfile(false);
    }
  };

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
    // onLogout (App.tsx's handler) already calls AuthContext's logout() and
    // navigates -- calling logout() here too fired it twice, racing a second
    // /auth/logout request against already-cleared tokens and causing a
    // stray 401 that triggered a hard window.location redirect on top of
    // the normal navigation (felt like the page refreshing twice).
    onLogout?.();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-(--glass-bg) border-b border-(--glass-border) shadow-(--glass-shadow)">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Hamburger Menu Button - Left Side */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-accent transition-colors text-gray-900 dark:text-white"
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
                <button
                  onClick={() => setNotificationModalOpen(true)}
                  className="p-2 hover:bg-accent rounded-full transition-colors relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button onClick={onOpenCart} className="p-2 hover:bg-accent rounded-full transition-colors relative">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center px-1">
                      {cartCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setProfileModalOpen(true)}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-white rounded-full hover:opacity-90 transition-all hover:shadow-(--glow-purple)"
                >
                  <User className="w-4 h-4" />
                  {user?.name?.split(' ')[0] || 'Profile'}
                </button>
              </>
            )}
            {!isAuthenticated && (
              <button
                onClick={onNavigateToLogin}
                className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-full hover:opacity-90 transition-all hover:shadow-(--glow-purple)"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Portaled to document.body: this nav has backdrop-blur-xl, which
          establishes a new CSS containing block for position:fixed
          descendants. Without the portal, "bottom-0" here resolves against
          the nav's own ~80px box instead of the viewport, collapsing this
          drawer's height to just its header and clipping everything below
          it (invisibly, since overflow-y-auto hides rather than spills). */}
      {createPortal(
        <>
      {/* 60% Dark Overlay Background - Covers entire page */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-9998 animate-fadeIn"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Left Slide-out Sidebar Menu - On top of overlay - Fully Opaque */}
      <div className={`fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-[#6b21a8] shadow-2xl z-9999 transform transition-transform duration-300 ease-out ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full bg-[#6b21a8]">
          {/* Sidebar Header with Logo and Close X Button */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-purple-700 shrink-0 bg-[#6b21a8]">
            <Logo className="h-8" />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-10 h-10 bg-purple-800 hover:bg-purple-700 rounded-lg flex items-center justify-center transition-colors text-white shrink-0"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Sidebar Navigation Content - Vertical Auto Layout, All Items Visible */}
          <div className="flex-1 px-5 py-4 flex flex-col bg-[#6b21a8]">
            <nav className="flex flex-col gap-1 shrink-0 bg-[#6b21a8]">
              {/* Show different menu based on authentication status */}
              {!isAuthenticated ? (
                <>
                  {/* Main Navigation Items - For Non-Authenticated Users */}
                  <a
                    href="#home"
                    className="shrink-0 block px-4 py-2.5 text-base text-gray-100 hover:text-white hover:bg-purple-800 rounded-lg transition-all font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </a>
                  <button
                    onClick={() => {
                      scrollToProducts();
                      setMobileMenuOpen(false);
                    }}
                    className="shrink-0 w-full text-left block px-4 py-2.5 text-base text-gray-100 hover:text-white hover:bg-purple-800 rounded-lg transition-all font-medium"
                  >
                    Shop
                  </button>
                  <a
                    href="#brands"
                    className="shrink-0 block px-4 py-2.5 text-base text-gray-100 hover:text-white hover:bg-purple-800 rounded-lg transition-all font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Brands
                  </a>
                  <button
                    onClick={() => {
                      scrollToFooter();
                      setMobileMenuOpen(false);
                    }}
                    className="shrink-0 w-full text-left block px-4 py-2.5 text-base text-gray-100 hover:text-white hover:bg-purple-800 rounded-lg transition-all font-medium"
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
                    className="shrink-0 w-full flex items-center gap-2.5 px-4 py-2.5 text-base text-gray-100 hover:text-white hover:bg-purple-800 rounded-lg transition-all font-medium"
                  >
                    <Clock className="w-5 h-5 shrink-0" />
                    <span>My Activity</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigateToAddresses?.();
                      setMobileMenuOpen(false);
                    }}
                    className="shrink-0 w-full flex items-center gap-2.5 px-4 py-2.5 text-base text-gray-100 hover:text-white hover:bg-purple-800 rounded-lg transition-all font-medium"
                  >
                    <MapPin className="w-5 h-5 shrink-0" />
                    <span>My Addresses</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigateToSettings?.();
                      setMobileMenuOpen(false);
                    }}
                    className="shrink-0 w-full flex items-center gap-2.5 px-4 py-2.5 text-base text-gray-100 hover:text-white hover:bg-purple-800 rounded-lg transition-all font-medium"
                  >
                    <Settings className="w-5 h-5 shrink-0" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigateToWishlist?.();
                      setMobileMenuOpen(false);
                    }}
                    className="shrink-0 w-full flex items-center gap-2.5 px-4 py-2.5 text-base text-gray-100 hover:text-white hover:bg-purple-800 rounded-lg transition-all font-medium"
                  >
                    <Heart className="w-5 h-5 shrink-0" />
                    <span>Wishlist</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="shrink-0 w-full flex items-center gap-2.5 px-4 py-2.5 text-base text-red-300 hover:text-red-100 hover:bg-red-900 rounded-lg transition-all font-medium"
                  >
                    <LogOut className="w-5 h-5 shrink-0" />
                    <span>Logout</span>
                  </button>
                </>
              )}

              {/* Sign In Button - Only for Non-Authenticated Users */}
              {!isAuthenticated && (
                <div className="shrink-0 pt-2 mt-2 border-t border-purple-700 bg-[#6b21a8]">
                  <button
                    onClick={() => {
                      onNavigateToLogin?.();
                      setMobileMenuOpen(false);
                    }}
                    className="shrink-0 w-full px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-medium transition-all"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </nav>
          </div>
        </div>
      </div>
        </>,
        document.body
      )}

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

      {/* Notification Drawer - Right Side. Portaled to document.body for the
          same containing-block reason as the mobile menu above. */}
      {notificationModalOpen && createPortal(
        <>
          {/* Dark Overlay - Covers Entire Page */}
          <div
            className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen bg-black/70 z-9998 animate-fadeIn"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
            onClick={() => setNotificationModalOpen(false)}
          />

          {/* Notification Drawer */}
          <div
            className={`fixed top-0 right-0 bottom-0 w-96 max-w-[90vw] z-9999 shadow-2xl transform transition-transform duration-300 ease-out ${
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

              {/* Notifications List -- derived from the customer's own orders */}
              <div className="flex-1 overflow-y-auto space-y-3">
                {!ordersLoaded && (
                  <p className="text-white/60 text-sm text-center py-8">Loading...</p>
                )}

                {ordersLoaded && orderNotifications.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Bell className="w-16 h-16 text-white/20 mb-4" />
                    <h3 className="text-white font-semibold text-lg mb-2">No Notifications</h3>
                    <p className="text-white/60 text-sm">You're all caught up!</p>
                  </div>
                )}

                {orderNotifications.map((order) => {
                  const copy = ORDER_STATUS_COPY[order.status];
                  const Icon = copy.icon;
                  const isUnread = !readKeys.has(readKeyFor(order));
                  return (
                    <button
                      key={order.id}
                      onClick={() => {
                        setReadKeys((prev) => new Set(prev).add(readKeyFor(order)));
                        setNotificationModalOpen(false);
                        onNavigateToActivity?.();
                      }}
                      className="w-full text-left bg-white/10 rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold text-sm mb-1">{copy.title}</h3>
                          <p className="text-white/60 text-xs mb-2">{copy.message(order.order_number)}</p>
                          <p className="text-white/40 text-xs">{formatRelativeTime(order.created_at)}</p>
                        </div>
                        {isUnread && <div className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-2"></div>}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Footer Action */}
              {orderNotifications.length > 0 && (
                <div className="mt-6 pt-4 border-t border-white/20">
                  <button
                    onClick={() => {
                      handleMarkAllRead();
                      setNotificationModalOpen(false);
                    }}
                    className="w-full px-6 py-3 rounded-lg bg-white text-purple-900 font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Mark All as Read
                  </button>
                </div>
              )}
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Profile Drawer - Right Side. Portaled to document.body for the same
          containing-block reason as the mobile menu above. */}
      {profileModalOpen && createPortal(
        <>
          {/* Dark Overlay - Covers Entire Page */}
          <div
            className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen bg-black/70 z-9998 animate-fadeIn"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
            onClick={() => setProfileModalOpen(false)}
          />

          {/* Profile Drawer */}
          <div
            className={`fixed top-0 right-0 bottom-0 w-96 max-w-[90vw] z-9999 shadow-2xl transform transition-transform duration-300 ease-out ${
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
                  <div className="w-32 h-32 rounded-full bg-linear-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white text-4xl font-bold border-4 border-white/20">
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
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    disabled
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white/60 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={user?.phone_number || 'Not set'}
                    readOnly
                    disabled
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white/60 cursor-not-allowed"
                  />
                  <p className="text-white/40 text-xs mt-1.5">Verify or change your phone number from Settings.</p>
                </div>

                {profileSaved && (
                  <p className="text-green-400 text-sm text-center">Profile updated.</p>
                )}
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
                  onClick={handleSaveProfile}
                  disabled={savingProfile || !profileName.trim()}
                  className="flex-1 px-6 py-3 rounded-lg bg-white text-purple-900 font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

    </nav>
  );
}

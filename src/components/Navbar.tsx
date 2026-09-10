import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  UtensilsCrossed,
  ShoppingBag,
  Search,
  LayoutDashboard,
  ClipboardList,
  Bell,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Menu as MenuIcon,
  X,
  Flame,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';

export const Navbar: React.FC = () => {
  const { isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { notifications, unreadCount, markAsRead, clearAll } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-[#0d0922]/90 backdrop-blur-xl border-b border-purple-500/20 shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <Link
            to="/"
            className="flex items-center gap-3 font-bold text-white shrink-0 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-teal-400 p-0.5 shadow-lg shadow-purple-600/30 group-hover:shadow-teal-400/30 transition-all duration-300">
              <div className="w-full h-full bg-[#0b081e] rounded-[14px] flex items-center justify-center text-teal-300">
                <UtensilsCrossed className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-purple-100 to-teal-300 bg-clip-text text-transparent">
                  CampusBites
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
              </div>
              <span className="block text-[10px] font-semibold tracking-wider text-purple-300 uppercase">
                Instant Token Food Court
              </span>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md mx-4 relative"
          >
            <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search dosa, biryani, burgers, chai, fries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-purple-950/30 border border-purple-500/25 rounded-full text-white placeholder-purple-300/40 focus:border-teal-400 focus:bg-purple-950/50 focus:outline-none transition-all"
            />
          </form>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            <Link
              to="/"
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                isActive('/')
                  ? 'text-white bg-purple-600/30 border border-purple-500/40 shadow-sm'
                  : 'text-purple-200 hover:text-white hover:bg-purple-900/30'
              }`}
            >
              Home
            </Link>
            <Link
              to="/menu"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                isActive('/menu')
                  ? 'text-white bg-purple-600/30 border border-purple-500/40 shadow-sm'
                  : 'text-purple-200 hover:text-white hover:bg-purple-900/30'
              }`}
            >
              <Flame className="w-4 h-4 text-teal-400" />
              <span>Menu</span>
            </Link>
            <Link
              to="/orders"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                isActive('/orders')
                  ? 'text-white bg-purple-600/30 border border-purple-500/40 shadow-sm'
                  : 'text-purple-200 hover:text-white hover:bg-purple-900/30'
              }`}
            >
              <ClipboardList className="w-4 h-4 text-purple-400" />
              <span>My Orders</span>
            </Link>
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 rounded-full text-purple-200 hover:text-white hover:bg-purple-900/40 border border-transparent hover:border-purple-500/30 transition-all"
                title="Live Alerts"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-teal-400 text-[#090816] text-[10px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-[#0d0922]">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-card rounded-2xl shadow-2xl border border-purple-500/30 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between px-4 pb-2 border-b border-purple-500/20">
                    <span className="font-semibold text-white text-sm flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-teal-400" />
                      Live Order Alerts
                    </span>
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAll}
                        className="text-xs text-purple-300 hover:text-teal-300 font-medium transition"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-purple-500/10">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-purple-300/60 text-sm">
                        <Clock className="w-8 h-8 mx-auto mb-2 text-purple-400/40 stroke-1" />
                        No order status updates yet.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markAsRead(notif.id)}
                          className={`p-3.5 hover:bg-purple-900/30 transition cursor-pointer ${
                            !notif.read ? 'bg-purple-900/20' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <CheckCircle2
                              className={`w-4 h-4 mt-0.5 shrink-0 ${
                                notif.type === 'success'
                                  ? 'text-teal-400'
                                  : notif.type === 'alert'
                                  ? 'text-rose-400'
                                  : 'text-purple-400'
                              }`}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-white">
                                {notif.title}
                              </p>
                              <p className="text-xs text-purple-200 mt-0.5 leading-relaxed">
                                {notif.message}
                              </p>
                              <span className="text-[10px] text-purple-400 mt-1 block">
                                {notif.timestamp}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Shopping Cart Button */}
            <Link
              to="/cart"
              className="relative flex items-center justify-center p-2.5 rounded-full text-purple-200 hover:text-white hover:bg-purple-900/40 border border-transparent hover:border-purple-500/30 transition-all"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-teal-400 text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md ring-2 ring-[#0d0922]">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Admin Overall Access Portal Button */}
            <Link
              to="/admin/orders"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                location.pathname.startsWith('/admin')
                  ? 'bg-gradient-to-r from-purple-600 to-teal-400 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-purple-900/50 hover:bg-purple-800/60 border border-purple-500/30 hover:border-teal-400/60 text-teal-300'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Staff Portal</span>
              {isAdmin && (
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-purple-200 hover:bg-purple-900/40 lg:hidden"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-purple-500/20 glass-panel px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search canteen menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-purple-950/60 border border-purple-500/30 rounded-xl text-white placeholder-purple-300/40 focus:outline-none focus:border-teal-400"
            />
          </form>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2.5 rounded-xl text-center text-sm font-medium ${
                isActive('/') ? 'bg-purple-600 text-white font-bold' : 'bg-purple-950/40 text-purple-200'
              }`}
            >
              Home
            </Link>
            <Link
              to="/menu"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2.5 rounded-xl text-center text-sm font-medium ${
                isActive('/menu') ? 'bg-purple-600 text-white font-bold' : 'bg-purple-950/40 text-purple-200'
              }`}
            >
              Menu
            </Link>
            <Link
              to="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2.5 rounded-xl text-center text-sm font-medium ${
                isActive('/orders') ? 'bg-purple-600 text-white font-bold' : 'bg-purple-950/40 text-purple-200'
              }`}
            >
              My Orders
            </Link>
            <Link
              to="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2.5 rounded-xl text-center text-sm font-medium ${
                isActive('/cart') ? 'bg-purple-600 text-white font-bold' : 'bg-purple-950/40 text-purple-200'
              }`}
            >
              Cart ({itemCount})
            </Link>
          </div>

          <div className="pt-2 border-t border-purple-500/20">
            <Link
              to="/admin/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-teal-400 text-white font-semibold text-sm shadow-md"
            >
              <ShieldCheck className="w-4 h-4" />
              Kitchen & Staff Admin Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

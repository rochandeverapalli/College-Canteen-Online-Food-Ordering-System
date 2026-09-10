import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  UtensilsCrossed,
  ShoppingBag,
  User,
  LogOut,
  LogIn,
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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';

export const Navbar: React.FC = () => {
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
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

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <Link
            to="/"
            className="flex items-center gap-2.5 font-bold text-stone-900 shrink-0 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <span className="block text-lg font-black tracking-tight text-stone-900 group-hover:text-amber-600 transition-colors">
                CampusBites
              </span>
              <span className="block text-[10px] font-semibold tracking-wider text-amber-700 uppercase">
                College Canteen
              </span>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md mx-4 relative"
          >
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search biryani, burgers, dosa, chai..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-stone-100 border border-transparent rounded-full focus:bg-white focus:border-amber-500 focus:outline-none transition-all placeholder:text-stone-400"
            />
          </form>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/') ? 'text-amber-600 bg-amber-50' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              Home
            </Link>
            <Link
              to="/menu"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/menu') ? 'text-amber-600 bg-amber-50' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              Menu
            </Link>
            {currentUser && (
              <Link
                to="/orders"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/orders') ? 'text-amber-600 bg-amber-50' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                Orders
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  location.pathname.startsWith('/admin')
                    ? 'text-amber-800 bg-amber-100 border border-amber-300'
                    : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-amber-600" />
                <span>Staff Portal</span>
              </Link>
            )}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-stone-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between px-4 pb-2 border-b border-stone-100">
                    <span className="font-semibold text-stone-900 text-sm flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Live Order Alerts
                    </span>
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAll}
                        className="text-xs text-stone-500 hover:text-stone-800 font-medium"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-stone-100">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-stone-400 text-sm">
                        <Clock className="w-8 h-8 mx-auto mb-2 text-stone-300 stroke-1" />
                        No order status updates yet.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markAsRead(notif.id)}
                          className={`p-3.5 hover:bg-stone-50 transition cursor-pointer ${
                            !notif.read ? 'bg-amber-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <CheckCircle2
                              className={`w-4 h-4 mt-0.5 shrink-0 ${
                                notif.type === 'success'
                                  ? 'text-emerald-500'
                                  : notif.type === 'alert'
                                  ? 'text-rose-500'
                                  : 'text-amber-500'
                              }`}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-stone-900">
                                {notif.title}
                              </p>
                              <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                                {notif.message}
                              </p>
                              <span className="text-[10px] text-stone-400 mt-1 block">
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
              className="relative flex items-center justify-center p-2 rounded-full text-stone-700 hover:text-amber-600 hover:bg-amber-50 transition-colors"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm ring-2 ring-white">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Profile / Auth */}
            {currentUser ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition"
                >
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">
                    {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">
                    {userProfile?.name || 'Student'}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-stone-900 text-white hover:bg-amber-600 text-xs font-semibold transition shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 lg:hidden"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search canteen menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-stone-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </form>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2.5 rounded-xl text-center text-sm font-medium ${
                isActive('/') ? 'bg-amber-50 text-amber-700 font-bold' : 'bg-stone-50 text-stone-700'
              }`}
            >
              Home
            </Link>
            <Link
              to="/menu"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2.5 rounded-xl text-center text-sm font-medium ${
                isActive('/menu') ? 'bg-amber-50 text-amber-700 font-bold' : 'bg-stone-50 text-stone-700'
              }`}
            >
              Menu
            </Link>
            <Link
              to="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2.5 rounded-xl text-center text-sm font-medium ${
                isActive('/orders') ? 'bg-amber-50 text-amber-700 font-bold' : 'bg-stone-50 text-stone-700'
              }`}
            >
              My Orders
            </Link>
            <Link
              to="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2.5 rounded-xl text-center text-sm font-medium ${
                isActive('/cart') ? 'bg-amber-50 text-amber-700 font-bold' : 'bg-stone-50 text-stone-700'
              }`}
            >
              Cart ({itemCount})
            </Link>
          </div>

          {isAdmin && (
            <div className="pt-2 border-t border-stone-100">
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full p-2.5 rounded-xl bg-amber-500 text-white font-semibold text-sm shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                Canteen Staff Admin Portal
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Utensils,
  FolderTree,
  BarChart3,
  Settings,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const ADMIN_LINKS = [
  { to: '/admin/orders', label: 'All Orders Queue', icon: ClipboardList },
  { to: '/admin/dashboard', label: 'Overview Metrics', icon: LayoutDashboard },
  { to: '/admin/food-items', label: 'Menu Catalog (26+ Items)', icon: Utensils },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/analytics', label: 'Revenue Analytics', icon: BarChart3 },
  { to: '/admin/settings', label: 'Canteen Controls', icon: Settings },
];

export const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0718] text-slate-100 pb-24">
      {/* Top Staff Banner */}
      <div className="bg-[#0e0a24] text-white border-b border-purple-500/20 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              Staff Master Portal • Live Order Dispatcher
            </span>
          </div>
          <Link
            to="/menu"
            className="text-xs text-purple-300 hover:text-white flex items-center gap-1.5 transition font-medium px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/30 hover:border-teal-400/50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Switch to Customer Menu</span>
          </Link>
        </div>
      </div>

      {/* Admin Navigation Bar */}
      <div className="bg-[#0d0922]/90 backdrop-blur-xl border-b border-purple-500/20 sticky top-16 z-20 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2.5 scrollbar-none">
            {ADMIN_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-teal-400 text-white shadow-lg shadow-purple-600/30'
                        : 'text-purple-300/80 hover:text-white hover:bg-purple-900/30'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Outlet */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

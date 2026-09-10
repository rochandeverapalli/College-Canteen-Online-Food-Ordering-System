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
} from 'lucide-react';

const ADMIN_LINKS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/orders', label: 'Kitchen Orders', icon: ClipboardList },
  { to: '/admin/food-items', label: 'Food Menu', icon: Utensils },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/settings', label: 'Canteen Settings', icon: Settings },
];

export const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-stone-100/70 pb-20">
      {/* Top Staff Banner */}
      <div className="bg-stone-900 text-white border-b border-stone-800 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Canteen Kitchen & Admin Management Portal
            </span>
          </div>
          <Link
            to="/menu"
            className="text-xs text-stone-400 hover:text-white flex items-center gap-1.5 transition font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Switch to Student View</span>
          </Link>
        </div>
      </div>

      {/* Admin Navigation Bar */}
      <div className="bg-white border-b border-stone-200 sticky top-16 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2.5 scrollbar-none">
            {ADMIN_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
};

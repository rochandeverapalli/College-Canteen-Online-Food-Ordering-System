import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Utensils, ShoppingBag, ClipboardList, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { itemCount } = useCart();

  const isActive = (path: string) => location.pathname === path;

  // Don't show bottom nav inside admin dashboard to prevent clutter
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0e0a24]/95 backdrop-blur-xl border-t border-purple-500/20 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
      <div className="grid grid-cols-5 h-16">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            isActive('/') ? 'text-teal-400 font-semibold' : 'text-purple-300/70 hover:text-purple-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </Link>

        <Link
          to="/menu"
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            isActive('/menu') ? 'text-teal-400 font-semibold' : 'text-purple-300/70 hover:text-purple-200'
          }`}
        >
          <Utensils className="w-5 h-5" />
          <span className="text-[10px]">Menu</span>
        </Link>

        <Link
          to="/cart"
          className={`relative flex flex-col items-center justify-center gap-1 transition-colors ${
            isActive('/cart') ? 'text-teal-400 font-semibold' : 'text-purple-300/70 hover:text-purple-200'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-gradient-to-r from-purple-500 to-teal-400 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-[#0e0a24]">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">Cart</span>
        </Link>

        <Link
          to="/orders"
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            isActive('/orders') ? 'text-teal-400 font-semibold' : 'text-purple-300/70 hover:text-purple-200'
          }`}
        >
          <ClipboardList className="w-5 h-5" />
          <span className="text-[10px]">Orders</span>
        </Link>

        <Link
          to="/admin/orders"
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            isActive('/admin/orders') ? 'text-teal-400 font-semibold' : 'text-purple-300/70 hover:text-purple-200'
          }`}
        >
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[10px]">Staff</span>
        </Link>
      </div>
    </div>
  );
};

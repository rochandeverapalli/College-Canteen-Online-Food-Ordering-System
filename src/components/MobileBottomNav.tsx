import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Utensils, ShoppingBag, ClipboardList, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { itemCount } = useCart();
  const { currentUser } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  // Don't show bottom nav inside admin dashboard to prevent clutter
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200 pb-safe">
      <div className="grid grid-cols-5 h-16">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            isActive('/') ? 'text-amber-600 font-semibold' : 'text-stone-500'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </Link>

        <Link
          to="/menu"
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            isActive('/menu') ? 'text-amber-600 font-semibold' : 'text-stone-500'
          }`}
        >
          <Utensils className="w-5 h-5" />
          <span className="text-[10px]">Menu</span>
        </Link>

        <Link
          to="/cart"
          className={`relative flex flex-col items-center justify-center gap-1 transition-colors ${
            isActive('/cart') ? 'text-amber-600 font-semibold' : 'text-stone-500'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">Cart</span>
        </Link>

        <Link
          to={currentUser ? '/orders' : '/login'}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            isActive('/orders') ? 'text-amber-600 font-semibold' : 'text-stone-500'
          }`}
        >
          <ClipboardList className="w-5 h-5" />
          <span className="text-[10px]">Orders</span>
        </Link>

        <Link
          to={currentUser ? '/profile' : '/login'}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            isActive('/profile') || isActive('/login') ? 'text-amber-600 font-semibold' : 'text-stone-500'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">Profile</span>
        </Link>
      </div>
    </div>
  );
};

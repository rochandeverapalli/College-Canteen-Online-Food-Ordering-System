import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  ArrowRight,
  Trash2,
  Clock,
  Sparkles,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { CartItemRow } from '../components/CartItemRow';

export const Cart: React.FC = () => {
  const { items, clearCart, itemCount, subtotal, tax, totalAmount, estimatedPrepTime } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    // Direct guest checkout - NO login requirement!
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-3xl bg-purple-900/40 border border-purple-500/30 text-teal-300 flex items-center justify-center mx-auto mb-4 shadow-xl">
          <ShoppingBag className="w-10 h-10 stroke-1" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight mb-2">
          Your Food Tray is Empty
        </h2>
        <p className="text-purple-300/70 text-sm max-w-sm mx-auto mb-6">
          Looks like you haven't selected any snacks or meals yet. Check out today's freshly prepared canteen menu!
        </p>
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-teal-400 hover:from-purple-500 hover:to-teal-300 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all"
        >
          <span>Explore 26+ Items Menu</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-purple-500/20">
        <div className="flex items-center gap-3">
          <Link
            to="/menu"
            className="p-2.5 rounded-2xl bg-purple-950/40 border border-purple-500/20 text-purple-300 hover:text-white hover:border-teal-400 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Review Your Cart
            </h1>
            <p className="text-xs sm:text-sm text-purple-300/70 mt-0.5">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} ready for instant counter prep
            </p>
          </div>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-950/40 hover:bg-rose-950/40 border border-purple-500/20 hover:border-rose-500/30 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Item List */}
        <div className="lg:col-span-7 space-y-3">
          {items.map((item) => (
            <CartItemRow key={item.foodId} item={item} />
          ))}

          {/* Prep time estimation callout */}
          <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/25 flex items-center gap-3">
            <Clock className="w-5 h-5 text-teal-400 shrink-0" />
            <div className="text-xs text-purple-200">
              <span className="font-bold text-white">Estimated kitchen preparation: </span>
              ~{estimatedPrepTime} minutes. Collect when token status displays Ready.
            </div>
          </div>
        </div>

        {/* Order Summary & Bill Box */}
        <div className="lg:col-span-5 glass-card rounded-3xl border border-purple-500/20 p-6 shadow-xl space-y-5 sticky top-24">
          <h3 className="text-lg font-bold text-white border-b border-purple-500/20 pb-3 flex items-center justify-between">
            <span>Bill Summary</span>
            <span className="text-xs text-teal-300 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> No Login Needed
            </span>
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-purple-200">
              <span>Item Subtotal ({itemCount} items)</span>
              <span className="font-semibold text-white">₹{subtotal}</span>
            </div>

            <div className="flex justify-between text-purple-200">
              <span>Canteen GST & Processing (5%)</span>
              <span className="font-semibold text-white">₹{tax}</span>
            </div>

            <div className="pt-3 border-t border-purple-500/20 flex justify-between items-baseline">
              <div>
                <span className="text-base font-black text-white block">Total Payable</span>
                <span className="text-[11px] text-purple-300/60">Sequential token generated on checkout</span>
              </div>
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-purple-200">
                ₹{totalAmount}
              </span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-400 hover:from-purple-500 hover:to-teal-300 text-white font-black text-sm shadow-xl shadow-purple-600/30 hover:shadow-teal-400/30 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
          >
            <span>Proceed to Order Details & Token</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-purple-300/60">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Instant Sequential Order Number Issued</span>
          </div>
        </div>
      </div>
    </div>
  );
};

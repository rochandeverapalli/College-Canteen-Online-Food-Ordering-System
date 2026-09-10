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
import { useAuth } from '../context/AuthContext';
import { CartItemRow } from '../components/CartItemRow';

export const Cart: React.FC = () => {
  const { items, clearCart, itemCount, subtotal, tax, totalAmount, estimatedPrepTime } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!currentUser) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-stone-900 tracking-tight mb-2">
          Your Cart is Empty
        </h2>
        <p className="text-stone-500 text-sm max-w-sm mx-auto mb-6">
          Looks like you haven't added any snacks or meals yet. Check out today's delicious menu!
        </p>
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md transition"
        >
          <span>Explore Menu</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <Link
            to="/menu"
            className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Review Your Cart
            </h1>
            <p className="text-xs sm:text-sm text-stone-500">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} ready for counter prep
            </p>
          </div>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-rose-50 transition"
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
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-xs text-amber-900">
              <span className="font-bold">Estimated kitchen preparation: </span>
              ~{estimatedPrepTime} minutes. Collect when token status displays Ready.
            </div>
          </div>
        </div>

        {/* Order Summary & Bill Box */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-5 sticky top-24">
          <h3 className="text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
            Order Summary
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-stone-600">
              <span>Item Subtotal ({itemCount} items)</span>
              <span className="font-semibold text-stone-900">₹{subtotal}</span>
            </div>

            <div className="flex justify-between text-stone-600">
              <span>Canteen GST & Processing (5%)</span>
              <span className="font-semibold text-stone-900">₹{tax}</span>
            </div>

            <div className="pt-3 border-t border-stone-100 flex justify-between items-baseline">
              <div>
                <span className="text-base font-black text-stone-900 block">Total Amount</span>
                <span className="text-[11px] text-stone-400">All campus taxes included</span>
              </div>
              <span className="text-2xl font-black text-stone-900">
                ₹{totalAmount}
              </span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full py-4 px-6 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-2 active:scale-98"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-stone-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Official College Token Issued Upon Payment Confirmation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

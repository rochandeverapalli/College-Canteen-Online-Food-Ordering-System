import React from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { CartItem } from '../types';
import { useCart } from '../context/CartContext';

interface CartItemRowProps {
  item: CartItem;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs">
      {/* Image */}
      <img
        src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80'}
        alt={item.name}
        referrerPolicy="no-referrer"
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 bg-stone-100"
      />

      {/* Item info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <div
            className={`w-3 h-3 border flex items-center justify-center rounded-xs ${
              item.isVeg ? 'border-emerald-600' : 'border-rose-700'
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                item.isVeg ? 'bg-emerald-600' : 'bg-rose-700'
              }`}
            />
          </div>
          <h4 className="text-sm sm:text-base font-bold text-stone-900 truncate">
            {item.name}
          </h4>
        </div>
        <p className="text-xs text-stone-500 font-medium">₹{item.price} each</p>

        <div className="flex items-center justify-between mt-2">
          {/* Quantity modifiers */}
          <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50 p-0.5">
            <button
              onClick={() => updateQuantity(item.foodId, -1)}
              className="w-7 h-7 rounded-lg bg-white hover:bg-stone-100 flex items-center justify-center text-stone-700 transition"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center text-xs font-bold text-stone-900">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.foodId, 1)}
              className="w-7 h-7 rounded-lg bg-white hover:bg-stone-100 flex items-center justify-center text-stone-700 transition"
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-black text-sm sm:text-base text-stone-900">
              ₹{item.subtotal}
            </span>
            <button
              onClick={() => removeItem(item.foodId)}
              className="text-stone-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
              title="Remove item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
    <div className="flex items-center gap-3 sm:gap-4 p-4 glass-card rounded-2xl border border-purple-500/20 shadow-md">
      {/* Image */}
      <img
        src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80'}
        alt={item.name}
        referrerPolicy="no-referrer"
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 bg-purple-950/40 border border-purple-500/30"
      />

      {/* Item info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <div
            className={`w-3.5 h-3.5 border flex items-center justify-center rounded-sm ${
              item.isVeg ? 'border-emerald-400' : 'border-rose-400'
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                item.isVeg ? 'bg-emerald-400' : 'bg-rose-500'
              }`}
            />
          </div>
          <h4 className="text-sm sm:text-base font-bold text-white truncate">
            {item.name}
          </h4>
        </div>
        <p className="text-xs text-purple-300/70 font-medium">₹{item.price} each</p>

        <div className="flex items-center justify-between mt-3">
          {/* Quantity modifiers */}
          <div className="flex items-center border border-purple-500/30 rounded-xl bg-purple-950/60 p-0.5">
            <button
              onClick={() => updateQuantity(item.foodId, -1)}
              className="w-7 h-7 rounded-lg bg-purple-900/60 hover:bg-purple-800 flex items-center justify-center text-teal-300 transition"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center text-xs font-bold text-white">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.foodId, 1)}
              className="w-7 h-7 rounded-lg bg-purple-900/60 hover:bg-purple-800 flex items-center justify-center text-teal-300 transition"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-black text-sm sm:text-base text-white">
              ₹{item.subtotal}
            </span>
            <button
              onClick={() => removeItem(item.foodId)}
              className="text-purple-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-950/40 transition"
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

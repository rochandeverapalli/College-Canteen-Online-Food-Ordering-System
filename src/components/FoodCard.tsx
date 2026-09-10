import React from 'react';
import { Clock, Star, Plus, Minus, Check } from 'lucide-react';
import { FoodItem } from '../types';
import { useCart } from '../context/CartContext';

interface FoodCardProps {
  food: FoodItem;
  onOpenDetails?: (food: FoodItem) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ food, onOpenDetails }) => {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find((i) => i.foodId === food.id);

  return (
    <div className="group bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all duration-200 overflow-hidden flex flex-col justify-between">
      {/* Image & Badges */}
      <div
        className="relative h-44 sm:h-48 w-full bg-stone-100 overflow-hidden cursor-pointer"
        onClick={() => onOpenDetails && onOpenDetails(food)}
      >
        <img
          src={food.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}
          alt={food.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Veg / Non-Veg Indicator Badge (FSSAI style) */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-2 py-1 rounded-md shadow-sm flex items-center gap-1.5 border border-stone-200">
          <div
            className={`w-3.5 h-3.5 border flex items-center justify-center rounded-sm ${
              food.isVeg ? 'border-emerald-600' : 'border-rose-700'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                food.isVeg ? 'bg-emerald-600' : 'bg-rose-700'
              }`}
            />
          </div>
          <span className="text-[10px] font-bold text-stone-700 uppercase tracking-wider">
            {food.isVeg ? 'Veg' : 'Non-Veg'}
          </span>
        </div>

        {/* Out of Stock Ribbon */}
        {!food.available && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-rose-600 text-white text-xs font-black uppercase px-3 py-1.5 rounded-md tracking-wider shadow-md">
              Out of Stock
            </span>
          </div>
        )}

        {/* Prep Time & Rating Tags */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
          {food.rating && (
            <div className="bg-stone-900/80 backdrop-blur text-amber-400 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{food.rating.toFixed(1)}</span>
            </div>
          )}
          <div className="bg-stone-900/80 backdrop-blur text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3 text-stone-300" />
            <span>{food.preparationTime || 10}m</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3
              onClick={() => onOpenDetails && onOpenDetails(food)}
              className="text-base font-bold text-stone-900 group-hover:text-amber-600 transition-colors cursor-pointer line-clamp-1"
            >
              {food.name}
            </h3>
          </div>
          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-3">
            {food.description}
          </p>
        </div>

        {/* Price & Action Button */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-100 mt-auto">
          <div>
            <span className="text-xs text-stone-400 block font-medium">Price</span>
            <span className="text-lg font-black text-stone-900">
              ₹{food.price}
            </span>
          </div>

          <div>
            {!food.available ? (
              <button
                disabled
                className="px-3.5 py-1.5 rounded-xl bg-stone-100 text-stone-400 text-xs font-bold cursor-not-allowed uppercase"
              >
                Unavailable
              </button>
            ) : cartItem ? (
              <div className="flex items-center gap-2 bg-amber-500 text-white rounded-xl px-2 py-1 shadow-sm">
                <button
                  onClick={() => updateQuantity(food.id, -1)}
                  className="p-1 hover:bg-amber-600 rounded-lg transition"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-bold text-xs px-1 min-w-[16px] text-center">
                  {cartItem.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(food.id, 1)}
                  className="p-1 hover:bg-amber-600 rounded-lg transition"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addItem(food, 1)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 text-white hover:bg-amber-600 font-semibold text-xs transition shadow-sm active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

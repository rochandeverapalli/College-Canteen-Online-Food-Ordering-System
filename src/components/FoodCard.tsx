import React from 'react';
import { Clock, Star, Plus, Minus } from 'lucide-react';
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
    <div className="group glass-card rounded-3xl border border-purple-500/20 hover:border-teal-400/50 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xl hover:shadow-[0_10px_30px_rgba(45,212,191,0.15)] hover:-translate-y-1">
      {/* Image & Badges */}
      <div
        className="relative h-44 sm:h-48 w-full bg-purple-950/40 overflow-hidden cursor-pointer"
        onClick={() => onOpenDetails && onOpenDetails(food)}
      >
        <img
          src={food.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}
          alt={food.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient overlay on image */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0a24] via-transparent to-black/30 pointer-events-none" />

        {/* Veg / Non-Veg Indicator Badge */}
        <div className="absolute top-3 left-3 bg-[#0d0922]/80 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1.5 border border-purple-500/30">
          <div
            className={`w-3.5 h-3.5 border flex items-center justify-center rounded-sm ${
              food.isVeg ? 'border-emerald-400' : 'border-rose-400'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                food.isVeg ? 'bg-emerald-400' : 'bg-rose-500'
              }`}
            />
          </div>
          <span className="text-[10px] font-bold text-white uppercase tracking-wider">
            {food.isVeg ? 'Veg' : 'Non-Veg'}
          </span>
        </div>

        {/* Out of Stock Overlay */}
        {!food.available && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-rose-600 text-white text-xs font-black uppercase px-3 py-1.5 rounded-xl tracking-wider shadow-lg">
              Out of Stock
            </span>
          </div>
        )}

        {/* Prep Time & Rating Tags */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
          {food.rating && (
            <div className="bg-purple-950/80 backdrop-blur-md text-teal-300 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-purple-500/30">
              <Star className="w-3 h-3 fill-teal-400 text-teal-400" />
              <span>{food.rating.toFixed(1)}</span>
            </div>
          )}
          <div className="bg-purple-950/80 backdrop-blur-md text-purple-200 text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-purple-500/30">
            <Clock className="w-3 h-3 text-teal-400" />
            <span>{food.preparationTime || 10}m</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3
              onClick={() => onOpenDetails && onOpenDetails(food)}
              className="text-base font-bold text-white group-hover:text-teal-300 transition-colors cursor-pointer line-clamp-1"
            >
              {food.name}
            </h3>
          </div>
          <p className="text-xs text-purple-200/70 line-clamp-2 leading-relaxed mb-3">
            {food.description}
          </p>
        </div>

        {/* Price & Action Button */}
        <div className="flex items-center justify-between pt-3 border-t border-purple-500/20 mt-auto">
          <div>
            <span className="text-[10px] text-purple-300/70 uppercase tracking-wider block font-semibold">Price</span>
            <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-white">
              ₹{food.price}
            </span>
          </div>

          <div>
            {!food.available ? (
              <button
                disabled
                className="px-3.5 py-1.5 rounded-xl bg-purple-950/50 text-purple-400/40 text-xs font-bold cursor-not-allowed uppercase border border-purple-500/10"
              >
                Unavailable
              </button>
            ) : cartItem ? (
              <div className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-teal-400 text-white rounded-xl px-2 py-1 shadow-md shadow-purple-600/30">
                <button
                  onClick={() => updateQuantity(food.id, -1)}
                  className="p-1 hover:bg-black/20 rounded-lg transition"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-bold text-xs px-1 min-w-[16px] text-center">
                  {cartItem.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(food.id, 1)}
                  className="p-1 hover:bg-black/20 rounded-lg transition"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addItem(food, 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-teal-400 hover:from-purple-500 hover:to-teal-300 text-white font-bold text-xs shadow-md shadow-purple-600/30 hover:shadow-teal-400/30 transition-all active:scale-95 cursor-pointer"
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

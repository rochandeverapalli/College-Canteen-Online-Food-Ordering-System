import React, { useState } from 'react';
import { X, Clock, Star, Plus, Minus, ShoppingBag, Check } from 'lucide-react';
import { FoodItem } from '../types';
import { useCart } from '../context/CartContext';

interface FoodDetailsModalProps {
  food: FoodItem | null;
  onClose: () => void;
}

export const FoodDetailsModal: React.FC<FoodDetailsModalProps> = ({ food, onClose }) => {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  if (!food) return null;

  const handleAddToCart = () => {
    addItem(food, qty);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="glass-card w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-purple-500/30 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header & Image */}
        <div className="relative h-60 sm:h-72 w-full bg-purple-950/40">
          <img
            src={food.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'}
            alt={food.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0a24] via-transparent to-black/40 pointer-events-none" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center backdrop-blur transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Veg/Non-veg tag */}
          <div className="absolute top-4 left-4 bg-[#0d0922]/80 backdrop-blur px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1.5 border border-purple-500/30">
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
            <span className="text-xs font-bold text-white">
              {food.isVeg ? 'Pure Veg' : 'Non-Veg'}
            </span>
          </div>

          {!food.available && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center">
              <span className="bg-rose-600 text-white text-sm font-bold uppercase px-4 py-2 rounded-xl tracking-wider shadow-lg">
                Currently Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Details Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {food.name}
              </h2>
              {food.categoryName && (
                <span className="text-xs font-semibold text-teal-300 bg-teal-950/60 border border-teal-500/30 px-3 py-0.5 rounded-full inline-block mt-1">
                  {food.categoryName}
                </span>
              )}
            </div>
            <div className="text-right shrink-0">
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-white block">
                ₹{food.price}
              </span>
              <span className="text-xs text-purple-300/60">incl. all taxes</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-purple-200 py-2.5 border-y border-purple-500/20">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-400" />
              <span>Prep Time: ~{food.preparationTime || 10} mins</span>
            </div>
            {food.rating && (
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-teal-400 fill-teal-400" />
                <span>{food.rating.toFixed(1)} rating</span>
              </div>
            )}
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300/60 mb-1">
              Description
            </h4>
            <p className="text-sm text-purple-200/80 leading-relaxed">
              {food.description}
            </p>
          </div>

          {/* Quantity selector & Add button */}
          {food.available && (
            <div className="pt-4 flex items-center gap-4">
              <div className="flex items-center border border-purple-500/30 rounded-2xl bg-purple-950/60 p-1">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-xl bg-purple-900/60 hover:bg-purple-800 flex items-center justify-center text-teal-300 shadow-sm transition"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-bold text-base text-white">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(20, q + 1))}
                  className="w-10 h-10 rounded-xl bg-purple-900/60 hover:bg-purple-800 flex items-center justify-center text-teal-300 shadow-sm transition"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={addedAnimation}
                className={`flex-1 py-3.5 px-6 rounded-2xl font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 ${
                  addedAnimation
                    ? 'bg-teal-400 text-slate-950'
                    : 'bg-gradient-to-r from-purple-600 to-teal-400 hover:from-purple-500 hover:to-teal-300 text-white shadow-purple-600/30 active:scale-98'
                }`}
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Food Tray!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Food Tray • ₹{food.price * qty}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Clock, Star, Plus, Minus, ShoppingBag, Check } from 'lucide-react';
import { FoodItem } from '../types';
import { useCart } from '../context/CartContext';

interface FoodDetailsModalProps {
  food: FoodItem | null;
  onClose: () => void;
}

export const FoodDetailsModal: React.FC<FoodDetailsModalProps> = ({ food, onClose }) => {
  const { addItem, items } = useCart();
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
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200 border border-stone-100 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header & Image */}
        <div className="relative h-60 sm:h-72 w-full bg-stone-100">
          <img
            src={food.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'}
            alt={food.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-900/70 hover:bg-stone-900 text-white flex items-center justify-center backdrop-blur transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Veg/Non-veg tag */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1.5 border border-stone-200">
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
            <span className="text-xs font-bold text-stone-800">
              {food.isVeg ? 'Pure Veg' : 'Non-Vegetarian'}
            </span>
          </div>

          {!food.available && (
            <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center">
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
              <h2 className="text-2xl font-black text-stone-900 tracking-tight">
                {food.name}
              </h2>
              {food.categoryName && (
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full inline-block mt-1">
                  {food.categoryName}
                </span>
              )}
            </div>
            <div className="text-right shrink-0">
              <span className="text-2xl font-black text-stone-900 block">
                ₹{food.price}
              </span>
              <span className="text-xs text-stone-400">incl. all taxes</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-stone-600 py-2 border-y border-stone-100">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Prep Time: ~{food.preparationTime || 10} mins</span>
            </div>
            {food.rating && (
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{food.rating.toFixed(1)} / 5.0 rating</span>
              </div>
            )}
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
              Description
            </h4>
            <p className="text-sm text-stone-600 leading-relaxed">
              {food.description}
            </p>
          </div>

          {/* Quantity selector & Add button */}
          {food.available && (
            <div className="pt-4 flex items-center gap-4">
              <div className="flex items-center border border-stone-200 rounded-2xl bg-stone-50 p-1">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-xl bg-white hover:bg-stone-100 flex items-center justify-center text-stone-700 shadow-sm transition"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-bold text-base text-stone-900">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(20, q + 1))}
                  className="w-10 h-10 rounded-xl bg-white hover:bg-stone-100 flex items-center justify-center text-stone-700 shadow-sm transition"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={addedAnimation}
                className={`flex-1 py-3 px-6 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                  addedAnimation
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 hover:bg-amber-600 text-white active:scale-98'
                }`}
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart • ₹{food.price * qty}</span>
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

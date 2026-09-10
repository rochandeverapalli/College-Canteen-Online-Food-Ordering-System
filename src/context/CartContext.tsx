import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, FoodItem } from '../types';

interface CartContextType {
  items: CartItem[];
  addItem: (food: FoodItem, quantity?: number) => void;
  removeItem: (foodId: string) => void;
  updateQuantity: (foodId: string, deltaOrQuantity: number, isAbsolute?: boolean) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  tax: number;
  totalAmount: number;
  estimatedPrepTime: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'college_canteen_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to persist cart:', e);
    }
  }, [items]);

  const addItem = (food: FoodItem, quantity = 1) => {
    if (!food.available) return;

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.foodId === food.id);
      if (existingIndex > -1) {
        const next = [...prev];
        const newQty = next[existingIndex].quantity + quantity;
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: newQty,
          subtotal: newQty * food.price,
        };
        return next;
      } else {
        return [
          ...prev,
          {
            foodId: food.id,
            name: food.name,
            price: food.price,
            quantity,
            subtotal: quantity * food.price,
            imageUrl: food.imageUrl,
            isVeg: food.isVeg,
            preparationTime: food.preparationTime || 10,
          },
        ];
      }
    });
  };

  const removeItem = (foodId: string) => {
    setItems((prev) => prev.filter((i) => i.foodId !== foodId));
  };

  const updateQuantity = (foodId: string, value: number, isAbsolute = false) => {
    setItems((prev) => {
      return prev
        .map((item) => {
          if (item.foodId === foodId) {
            const nextQty = isAbsolute ? value : item.quantity + value;
            if (nextQty <= 0) return null;
            return {
              ...item,
              quantity: nextQty,
              subtotal: nextQty * item.price,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  // Standard 5% GST on canteen foods
  const tax = Math.round(subtotal * 0.05);
  const totalAmount = subtotal + tax;

  // Estimated preparation time is maximum of item prep times + 2 mins per additional unique item
  const estimatedPrepTime =
    items.length > 0
      ? Math.max(...items.map((i) => i.preparationTime || 10)) + (items.length - 1) * 2
      : 0;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        tax,
        totalAmount,
        estimatedPrepTime,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

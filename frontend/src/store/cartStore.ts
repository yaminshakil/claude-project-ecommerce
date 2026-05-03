'use client';

import { create } from 'zustand';
import { CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,

  setItems: (items) => set({ items }),

  addItem: (item) => {
    const existing = get().items.find((i) => i.id === item.id);
    if (existing) {
      set({
        items: get().items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        ),
      });
    } else {
      set({ items: [...get().items, item] });
    }
  },

  removeItem: (itemId) => {
    set({ items: get().items.filter((i) => i.id !== itemId) });
  },

  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId);
      return;
    }
    set({
      items: get().items.map((i) =>
        i.id === itemId ? { ...i, quantity } : i
      ),
    });
  },

  clearCart: () => set({ items: [] }),

  totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

  totalPrice: () =>
    get().items.reduce(
      (sum, item) =>
        sum +
        (item.variant ? item.variant.price : item.product.price) * item.quantity,
      0
    ),
}));

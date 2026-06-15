import { create } from 'zustand';
import * as cartApi from '../api/cart';
import type { Cart } from '../types';

interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
  reset: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const cart = await cartApi.getCart();
      set({ cart, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addItem: async (productId, quantity = 1) => {
    const cart = await cartApi.addItem(productId, quantity);
    set({ cart });
  },

  updateItem: async (productId, quantity) => {
    const cart = await cartApi.updateItem(productId, quantity);
    set({ cart });
  },

  removeItem: async (productId) => {
    const cart = await cartApi.removeItem(productId);
    set({ cart });
  },

  clear: async () => {
    const cart = await cartApi.clearCart();
    set({ cart });
  },

  reset: () => set({ cart: null, error: null }),
}));

import { create } from "zustand";
import { cartAPI } from "../services/apis/index";

export const useCartStore = create((set, get) => ({
  cart: [], // items from backend: { productId: { _id, title, price, stock }, quantity, priceAtTime }
  loading: false,
  error: null,

  // Fetch cart from backend
  fetchCart: async () => {
    set({ loading: true, error: null });
    try {
      const res = await cartAPI.getCart();
      const items = res.data?.data?.items || [];
      set({ cart: items, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // Add item to cart via backend
  addToCart: async (productId, quantity = 1) => {
    try {
      await cartAPI.addToCart({ productId, quantity });
      await get().fetchCart();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // Update quantity via backend
  updateQty: async (productId, quantity) => {
    try {
      await cartAPI.updateQuantity({ productId, quantity });
      await get().fetchCart();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // Remove item from cart via backend
  removeFromCart: async (productId) => {
    try {
      await cartAPI.removeFromCart(productId);
      await get().fetchCart();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // Clear local cart state (used after order placed)
  clearCart: () => set({ cart: [] }),

  // Get total
  getTotal: () => {
    return get().cart.reduce(
      (sum, item) =>
        sum + (item.priceAtTime || item.productId?.price || 0) * item.quantity,
      0
    );
  },
}));

import { create } from "zustand";

export const useCartStore = create((set, get) => ({
  cart: [],

  addToCart: (product) => {
    const cart = get().cart;
    const existing = cart.find((p) => p.id === product.id);

    if (existing) {
      set({
        cart: cart.map((p) =>
          p.id === product.id ? { ...p, qty: p.qty + 1 } : p
        ),
      });
    } else {
      set({ cart: [...cart, { ...product, qty: 1 }] });
    }
  },

  removeFromCart: (id) => {
    set({ cart: get().cart.filter((p) => p.id !== id) });
  },

  updateQty: (id, qty) =>
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === id ? { ...item, qty } : item
      ),
    })),
  

  clearCart: () => set({ cart: [] }),
}));

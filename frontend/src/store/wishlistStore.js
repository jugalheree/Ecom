import { create } from "zustand";

export const useWishlistStore = create((set, get) => ({
  wishlist: [],

  toggleWishlist: (product) => {
    const list = get().wishlist;
    const exists = list.find((p) => p.id === product.id);

    if (exists) {
      set({ wishlist: list.filter((p) => p.id !== product.id) });
    } else {
      set({ wishlist: [...list, product] });
    }
  },

  isWishlisted: (id) => {
    return get().wishlist.some((p) => p.id === id);
  },
}));

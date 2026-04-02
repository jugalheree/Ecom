import { create } from "zustand";

const WISHLIST_KEY = "ts_wishlist";

const loadWishlist = () => {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
  } catch {
    return [];
  }
};

export const useWishlistStore = create((set, get) => ({
  wishlist: loadWishlist(),

  toggleWishlist: (product) => {
    const list = get().wishlist;
    const id = product._id || product.id;
    const exists = list.find((p) => (p._id || p.id) === id);
    const updated = exists
      ? list.filter((p) => (p._id || p.id) !== id)
      : [...list, product];
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
    set({ wishlist: updated });
  },

  isWishlisted: (id) => {
    return get().wishlist.some((p) => (p._id || p.id) === id);
  },
}));

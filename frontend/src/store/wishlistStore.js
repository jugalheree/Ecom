import { create } from "zustand";
import { wishlistAPI } from "../services/apis/index";
import { useAuthStore } from "./authStore";

const WISHLIST_KEY = "ts_wishlist_guest";

// ── Guest helpers (used when not logged in) ───────────────────────────────
const loadGuest = () => {
  try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]"); }
  catch { return []; }
};
const saveGuest = (list) => {
  try { localStorage.setItem(WISHLIST_KEY, JSON.stringify(list)); }
  catch {}
};

export const useWishlistStore = create((set, get) => ({
  wishlist: loadGuest(),   // start with guest list; replaced on login
  loading: false,

  // ── Fetch from backend (call after login) ─────────────────────────────
  fetchWishlist: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    set({ loading: true });
    try {
      const res = await wishlistAPI.getWishlist();
      const items = res.data?.data?.items || [];
      set({ wishlist: items, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  // ── Toggle (add / remove) — syncs with backend when logged in ─────────
  toggleWishlist: async (product) => {
    const user = useAuthStore.getState().user;
    const id = product._id || product.id;

    if (!user) {
      // Guest: localStorage only
      const list = get().wishlist;
      const exists = list.some((p) => (p._id || p.id) === id);
      const updated = exists
        ? list.filter((p) => (p._id || p.id) !== id)
        : [...list, product];
      saveGuest(updated);
      set({ wishlist: updated });
      return !exists;
    }

    // Logged in: call backend
    try {
      const res = await wishlistAPI.toggle(id);
      const wishlisted = res.data?.data?.wishlisted;
      // Refresh full list to get populated product details
      await get().fetchWishlist();
      return wishlisted;
    } catch {
      return null;
    }
  },

  // ── Check single product ──────────────────────────────────────────────
  isWishlisted: (id) => {
    return get().wishlist.some((p) => (p._id || p.id) === id);
  },

  // ── Clear ─────────────────────────────────────────────────────────────
  clearWishlist: async () => {
    const user = useAuthStore.getState().user;
    if (user) {
      try { await wishlistAPI.clear(); } catch {}
    }
    localStorage.removeItem(WISHLIST_KEY);
    set({ wishlist: [] });
  },
}));

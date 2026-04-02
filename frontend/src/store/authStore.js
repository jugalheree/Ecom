import { create } from "zustand";
import api from "../services/api";
import { wishlistAPI } from "../services/apis/index";

// FIX: Only store non-sensitive user profile data in localStorage.
// The JWT access token must NOT be stored in localStorage — it's vulnerable to XSS.
// Authentication relies on httpOnly cookies set by the backend.
const getSavedAuth = () => {
  try {
    const raw = localStorage.getItem("auth");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem("auth");
    return null;
  }
};

const savedAuth = getSavedAuth();

export const useAuthStore = create((set) => ({
  user: savedAuth?.user || null,
  // FIX: Token removed from state — auth is handled via httpOnly cookies only
  role: savedAuth?.role || null,

  login: async (data) => {
    const authPayload = { user: data.user, role: data.role };
    try { localStorage.setItem("auth", JSON.stringify(authPayload)); } catch {}
    set({ user: data.user, role: data.role });

    // Sync wishlist from backend after login (non-blocking)
    try {
      const { useWishlistStore } = await import("./wishlistStore");
      useWishlistStore.getState().fetchWishlist();
    } catch {}
  },

  logout: async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {}
    finally {
      localStorage.removeItem("auth");
      set({ user: null, role: null });
    }
  },

  setUser: (updatedUser) => {
    set((state) => {
      const newUser = { ...state.user, ...updatedUser };
      try {
        const saved = getSavedAuth();
        if (saved) {
          localStorage.setItem("auth", JSON.stringify({ ...saved, user: newUser }));
        }
      } catch {}
      return { user: newUser };
    });
  },
}));

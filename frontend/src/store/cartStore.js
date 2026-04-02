import { create } from "zustand";
import { cartAPI } from "../services/apis/index";

// ── Guest cart helpers (localStorage) ────────────────────────────────────────
const GUEST_CART_KEY = "ts_guest_cart";

const loadGuestCart = () => {
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveGuestCart = (items) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
};

const isLoggedIn = () => {
  try {
    // FIX: Check for user object — token is no longer stored in localStorage
    const auth = JSON.parse(localStorage.getItem("auth") || "null");
    return !!(auth?.user);
  } catch {
    return false;
  }
};

export const useCartStore = create((set, get) => ({
  cart: [],
  loading: false,
  error: null,

  // Fetch cart — backend if logged in, localStorage if guest
  fetchCart: async () => {
    set({ loading: true, error: null });
    if (isLoggedIn()) {
      try {
        const res = await cartAPI.getCart();
        const items = res.data?.data?.items || [];
        set({ cart: items, loading: false });
      } catch (err) {
        set({ error: err.message, loading: false });
      }
    } else {
      set({ cart: loadGuestCart(), loading: false });
    }
  },

  // Add to cart — backend or guest
  addToCart: async (productId, quantity = 1, productData = null) => {
    if (isLoggedIn()) {
      try {
        await cartAPI.addToCart({ productId, quantity });
        await get().fetchCart();
        return { success: true };
      } catch (err) {
        return { success: false, message: err.message };
      }
    } else {
      // Guest mode — store product snapshot in localStorage
      const current = loadGuestCart();
      const idx = current.findIndex((i) => i._id === productId);
      if (idx >= 0) {
        current[idx].quantity = (current[idx].quantity || 1) + quantity;
      } else {
        current.push({
          _id: productId,
          productId,
          quantity,
          name: productData?.title || productData?.name || "Product",
          price: productData?.price || 0,
          imageUrl: productData?.imageUrl || productData?.image || null,
          vendor: productData?.vendor || "",
          priceAtTime: productData?.price || 0,
        });
      }
      saveGuestCart(current);
      set({ cart: current });
      return { success: true };
    }
  },

  // Update quantity
  updateQuantity: (productId, quantity) => {
    if (isLoggedIn()) {
      // backend update (fire-and-forget, optimistic)
      cartAPI.updateQuantity({ productId, quantity }).catch(() => {});
    }
    const current = isLoggedIn() ? get().cart : loadGuestCart();
    const updated = current.map((i) =>
      (i._id || i.productId) === productId ? { ...i, quantity } : i
    );
    if (!isLoggedIn()) saveGuestCart(updated);
    set({ cart: updated });
  },

  // Remove
  removeFromCart: (productId) => {
    if (isLoggedIn()) {
      cartAPI.removeFromCart(productId).catch(() => {});
    }
    const current = isLoggedIn() ? get().cart : loadGuestCart();
    const updated = current.filter((i) => (i._id || i.productId) !== productId);
    if (!isLoggedIn()) saveGuestCart(updated);
    set({ cart: updated });
    return { success: true };
  },

  // After login — sync guest cart to backend, then clear localStorage
  syncGuestCartToBackend: async () => {
    const guestItems = loadGuestCart();
    if (guestItems.length === 0) return;
    for (const item of guestItems) {
      try {
        await cartAPI.addToCart({ productId: item.productId || item._id, quantity: item.quantity });
      } catch {}
    }
    localStorage.removeItem(GUEST_CART_KEY);
    await get().fetchCart();
  },

  clearCart: () => {
    localStorage.removeItem(GUEST_CART_KEY);
    set({ cart: [] });
  },

  getTotal: () => {
    return get().cart.reduce(
      (sum, item) =>
        sum + (item.priceAtTime || item.price || item.productId?.price || 0) * (item.quantity || 1),
      0
    );
  },
}));

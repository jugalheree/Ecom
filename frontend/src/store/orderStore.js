import { create } from "zustand";
import { orderAPI } from "../services/apis/index";

export const useOrderStore = create((set) => ({
  orders: [],
  loading: false,
  error: null,

  // Place order via backend
  placeOrder: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await orderAPI.placeOrder(data);
      const order = res.data?.data;
      set((state) => ({
        orders: [order, ...state.orders],
        loading: false,
      }));
      return { success: true, order };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false, message: err.message };
    }
  },

  // Legacy local add (fallback)
  addOrder: (order) =>
    set((state) => ({
      orders: [
        {
          id: Date.now(),
          status: "Processing",
          date: new Date().toLocaleDateString(),
          ...order,
        },
        ...state.orders,
      ],
    })),
}));

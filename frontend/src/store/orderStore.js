import { create } from "zustand";
import { orderAPI } from "../services/apis/index";

export const useOrderStore = create((set) => ({
  orders: [],
  currentOrder: null,
  pagination: { page: 1, pages: 1, total: 0 },
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

  // Fetch paginated order list for buyer
  fetchMyOrders: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const res = await orderAPI.getMyOrders(params);
      const data = res.data?.data;
      set({
        orders: data?.orders || [],
        pagination: {
          page: data?.page || 1,
          pages: data?.pages || 1,
          total: data?.total || 0,
        },
        loading: false,
      });
      return { success: true };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false, message: err.message };
    }
  },

  // Fetch single order detail
  fetchOrderDetails: async (orderId) => {
    set({ loading: true, error: null });
    try {
      const res = await orderAPI.getOrderDetails(orderId);
      const order = res.data?.data;
      set({ currentOrder: order, loading: false });
      return { success: true, order };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false, message: err.message };
    }
  },

  // Pay for a pending order
  payOrder: async (orderId) => {
    set({ loading: true, error: null });
    try {
      const res = await orderAPI.payOrder(orderId);
      const order = res.data?.data;
      // Update current order and list in-place
      set((state) => ({
        currentOrder: state.currentOrder?._id === orderId ? order : state.currentOrder,
        orders: state.orders.map((o) => (o._id === orderId ? order : o)),
        loading: false,
      }));
      return { success: true, order };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false, message: err.message };
    }
  },
}));

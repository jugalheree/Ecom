import { create } from "zustand";
import { orderAPI, vendorAPI } from "../services/apis/index";

export const useOrderStore = create((set, get) => ({
  orders: [],
  currentOrder: null,
  timeline: [],
  vendorOrders: [],
  vendorPagination: { page: 1, totalPages: 1, total: 0 },
  pagination: { page: 1, totalPages: 1, total: 0 },
  loading: false,
  error: null,

  // Place order
  placeOrder: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await orderAPI.placeOrder(data);
      const order = res.data?.data;
      set((state) => ({ orders: [order, ...state.orders], loading: false }));
      return { success: true, order };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false, message: err.response?.data?.message || err.message };
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
          page: data?.pagination?.page || 1,
          totalPages: data?.pagination?.totalPages || 1,
          total: data?.pagination?.total || 0,
        },
        loading: false,
      });
      return { success: true };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false, message: err.response?.data?.message || err.message };
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
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },

  // Pay for a pending order
  payOrder: async (orderId) => {
    set({ loading: true, error: null });
    try {
      const res = await orderAPI.payOrder(orderId);
      const order = res.data?.data;
      set((state) => ({
        currentOrder:
          state.currentOrder?.order?.orderId === orderId ||
          state.currentOrder?._id === orderId
            ? { ...state.currentOrder, order: { ...state.currentOrder.order, ...order } }
            : state.currentOrder,
        orders: state.orders.map((o) => (o._id === orderId ? order : o)),
        loading: false,
      }));
      return { success: true, order };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },

  // Confirm delivery of an item
  confirmDelivery: async (orderId, productId) => {
    set({ loading: true, error: null });
    try {
      await orderAPI.confirmDelivery(orderId, { productId });
      // Refresh order details
      await get().fetchOrderDetails(orderId);
      return { success: true };
    } catch (err) {
      set({ loading: false });
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    set({ loading: true, error: null });
    try {
      await orderAPI.cancelOrder(orderId);
      await get().fetchOrderDetails(orderId);
      return { success: true };
    } catch (err) {
      set({ loading: false });
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },

  // Request return for an item
  requestReturn: async (orderId, formData) => {
    set({ loading: true, error: null });
    try {
      await orderAPI.requestReturn(orderId, formData);
      await get().fetchOrderDetails(orderId);
      return { success: true };
    } catch (err) {
      set({ loading: false });
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },

  // Fetch order timeline
  fetchOrderTimeline: async (orderId) => {
    try {
      const res = await orderAPI.getOrderTimeline(orderId);
      set({ timeline: res.data?.data || [] });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },

  // ── Vendor actions ──

  fetchVendorOrders: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const res = await vendorAPI.getOrders(params);
      const data = res.data?.data;
      set({
        vendorOrders: data?.orders || [],
        vendorPagination: {
          page: data?.pagination?.page || 1,
          totalPages: data?.pagination?.totalPages || 1,
          total: data?.pagination?.total || 0,
        },
        loading: false,
      });
      return { success: true };
    } catch (err) {
      set({ loading: false });
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },

  shipOrderItem: async (orderId, productId, action) => {
    try {
      await vendorAPI.shipOrder(orderId, { productId, action });
      await get().fetchVendorOrders();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },

  reviewReturn: async (returnId, action, remark) => {
    try {
      await vendorAPI.reviewReturn(returnId, { action, remark });
      await get().fetchVendorOrders();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },

  markReturnPickedUp: async (returnId) => {
    try {
      await vendorAPI.markReturnPickedUp(returnId);
      await get().fetchVendorOrders();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },

  markReturnReceived: async (returnId) => {
    try {
      await vendorAPI.markReturnReceived(returnId);
      await get().fetchVendorOrders();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },
}));
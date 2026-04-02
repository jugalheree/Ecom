import { create } from "zustand";
import { walletAPI } from "../services/apis/index";

export const useWalletStore = create((set, get) => ({
  balance: 0,
  locked: 0,
  available: 0,
  withdrawn: 0,
  transactions: [],
  loading: false,
  error: null,

  fetchWallet: async () => {
    set({ loading: true, error: null });
    try {
      const res = await walletAPI.getWallet();
      const d = res.data?.data;
      set({
        balance: d?.balance || 0,
        locked: d?.locked || 0,
        available: d?.available || 0,
        withdrawn: d?.withdrawn || 0,
        transactions: d?.transactions || [],
        loading: false,
      });
    } catch (err) {
      set({ error: err?.response?.data?.message || "Failed to load wallet", loading: false });
    }
  },

  addMoney: async (amount) => {
    try {
      await walletAPI.addMoney(amount);
      await get().fetchWallet();
      return { success: true };
    } catch (err) {
      return { success: false, message: err?.response?.data?.message || "Failed to add money" };
    }
  },

  withdrawMoney: async (amount) => {
    try {
      await walletAPI.withdraw(amount);
      await get().fetchWallet();
      return { success: true };
    } catch (err) {
      return { success: false, message: err?.response?.data?.message || "Failed to withdraw" };
    }
  },

  // Legacy sync actions kept for any existing consumers
  holdAmount: () => {},
  releaseAmount: () => {},
}));

import { create } from "zustand";

export const useWalletStore = create((set) => ({
  balance: 5000,
  held: 0,
  transactions: [],

  holdAmount: (amount) =>
    set((state) => ({
      balance: state.balance - amount,
      held: state.held + amount,
      transactions: [
        {
          id: Date.now(),
          type: "hold",
          amount,
          note: "Amount held in escrow",
        },
        ...state.transactions,
      ],
    })),

  addMoney: (amount) =>
    set((state) => ({
      balance: state.balance + amount,
      transactions: [
        {
          id: Date.now(),
          type: "add",
          amount,
          note: "Money added to wallet",
        },
        ...state.transactions,
      ],
    })),
}));

import { create } from "zustand";

export const useWalletStore = create((set) => ({
  balance: 5000,
  held: 0,
  transactions: [],

  addMoney: (amount) =>
    set((s) => ({
      balance: s.balance + amount,
      transactions: [
        {
          title: "Money added",
          amount: amount,
          date: new Date().toLocaleString(),
        },
        ...s.transactions,
      ],
    })),

  withdrawMoney: (amount) =>
    set((s) => ({
      balance: s.balance - amount,
      transactions: [
        {
          title: "Money withdrawn",
          amount: -amount,
          date: new Date().toLocaleString(),
        },
        ...s.transactions,
      ],
    })),

  holdAmount: (amount) =>
    set((s) => ({
      held: s.held + amount,
      transactions: [
        {
          title: "Amount held in escrow",
          amount: -amount,
          date: new Date().toLocaleString(),
        },
        ...s.transactions,
      ],
    })),

  releaseAmount: (amount) =>
    set((s) => ({
      held: s.held - amount,
      transactions: [
        {
          title: "Escrow released",
          amount: amount,
          date: new Date().toLocaleString(),
        },
        ...s.transactions,
      ],
    })),
}));

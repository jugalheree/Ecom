import { create } from "zustand";

export const useOrderStore = create((set) => ({
  orders: [],

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

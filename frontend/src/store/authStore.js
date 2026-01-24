import { create } from "zustand";

const savedAuth = JSON.parse(localStorage.getItem("auth"));

export const useAuthStore = create((set) => ({
  user: savedAuth?.user || null,
  token: savedAuth?.token || null,
  role: savedAuth?.role || null, // "buyer" | "vendor"

  login: (data) => {
    localStorage.setItem("auth", JSON.stringify(data));
    set({
      user: data.user,
      token: data.token,
      role: data.role,
    });
  },

  logout: () => {
    localStorage.removeItem("auth");
    set({
      user: null,
      token: null,
      role: null,
    });
  },
}));

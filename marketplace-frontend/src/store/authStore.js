import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("auth"))?.user || null,
  token: JSON.parse(localStorage.getItem("auth"))?.token || null,
  role: JSON.parse(localStorage.getItem("auth"))?.role || null,

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

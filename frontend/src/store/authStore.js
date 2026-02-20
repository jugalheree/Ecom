import { create } from "zustand";
import api from "../services/api";

// Safely parse localStorage
const getSavedAuth = () => {
  try {
    const authData = localStorage.getItem("auth");
    if (!authData) return null;
    return JSON.parse(authData);
  } catch (error) {
    console.error("Error parsing auth data:", error);
    localStorage.removeItem("auth");
    return null;
  }
};

const savedAuth = getSavedAuth();

export const useAuthStore = create((set) => ({
  user: savedAuth?.user || null,
  token: savedAuth?.token || null,
  role: savedAuth?.role || null, // "buyer" | "vendor"

  login: (data) => {
    try {
      localStorage.setItem("auth", JSON.stringify(data));
      set({
        user: data.user,
        token: data.token,
        role: data.role,
      });
    } catch (error) {
      console.error("Error saving auth data:", error);
    }
  },

  logout: async () => {
    try {
      // Call backend logout API if token exists
      const authData = getSavedAuth();
      if (authData?.token) {
        try {
          await api.post("/api/auth/logout");
        } catch (error) {
          // Log but don't block logout
          console.error("Logout API error:", error);
        }
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("auth");
      set({
        user: null,
        token: null,
        role: null,
      });
    }
  },
}));

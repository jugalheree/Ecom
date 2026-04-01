import axios from "axios";

// FIX: Use VITE_API_BASE_URL to match the actual .env key name (was VITE_API_URL causing silent fallback to localhost)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  withCredentials: true, // Sends httpOnly cookies on every request — primary auth mechanism
});

// FIX: Removed request interceptor that read JWT token from localStorage.
// Auth is now handled entirely via httpOnly cookies set by the backend.
// This eliminates the XSS token-theft vector.

// Response interceptor — handle 401s with silent token refresh via cookie
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve()));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // If 401 and not already a retry, attempt silent token refresh via cookie
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes("/auth/refresh-token")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(original))
          .catch((err) => Promise.reject(err));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        // Refresh happens via httpOnly cookie — no token in body needed
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/api/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        processQueue(null);
        return api(original);
      } catch {
        processQueue(new Error("Session expired"));
        localStorage.removeItem("auth");
        if (
          !window.location.pathname.includes("/login") &&
          !window.location.pathname.includes("/register")
        ) {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response) {
      const errorData = error.response.data;
      const errorMessage =
        errorData?.message || errorData?.error || "An error occurred";

      return Promise.reject({
        message: errorMessage,
        status: error.response.status,
        data: errorData,
      });
    }

    return Promise.reject({
      message: "Network error. Please check your connection and backend server.",
      status: 0,
    });
  }
);

export default api;

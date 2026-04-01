import axios from "axios";

// FIX: Use VITE_API_BASE_URL (matches .env) — was VITE_API_URL causing silent localhost fallback
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  withCredentials: true, // send httpOnly cookies on every request (secure)
});

// FIX: Removed localStorage token interceptor — auth is via httpOnly cookie only
// No Authorization header needed; cookies are sent automatically with withCredentials: true

// Intercept 401 responses — try silent token refresh once (via cookie)
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

    if (error.response?.status === 401 && !original._retry) {
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
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/api/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        processQueue(null);
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError);
        localStorage.removeItem("auth");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

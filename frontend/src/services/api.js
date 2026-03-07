import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  withCredentials: true, // Important for cookies (refreshToken)
});

// Request interceptor: attach access token from localStorage
api.interceptors.request.use((config) => {
  try {
    const authData = localStorage.getItem("auth");
    if (authData) {
      const { token } = JSON.parse(authData);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch {
    // ignore parse errors
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // If 401 and not a retry, try to refresh the token
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes("/auth/refresh-token")
    ) {
      original._retry = true;
      try {
        const refreshRes = await axios.post(
          `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        const newToken = refreshRes.data?.data?.accessToken;
        if (newToken) {
          // Update stored token
          const authData = localStorage.getItem("auth");
          if (authData) {
            const parsed = JSON.parse(authData);
            parsed.token = newToken;
            localStorage.setItem("auth", JSON.stringify(parsed));
          }
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        }
      } catch {
        // Refresh failed — redirect to login
        localStorage.removeItem("auth");
        if (
          !window.location.pathname.includes("/login") &&
          !window.location.pathname.includes("/register")
        ) {
          window.location.href = "/login";
        }
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

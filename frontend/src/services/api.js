import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:2000",
  withCredentials: true, // Important for cookies
});

api.interceptors.request.use((config) => {
  const data = localStorage.getItem("auth");
  if (data) {
    const { token } = JSON.parse(data);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // Backend returns data in response.data
    return response;
  },
  (error) => {
    // Handle errors
    if (error.response) {
      // Server responded with error status
      const errorData = error.response.data;
      const errorMessage = errorData?.message || errorData?.error || "An error occurred";
      
      // Handle 401 Unauthorized - clear auth and redirect to login
      if (error.response.status === 401) {
        const authData = localStorage.getItem("auth");
        if (authData) {
          localStorage.removeItem("auth");
          // Only redirect if not already on login/register page
          if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
            window.location.href = '/login';
          }
        }
      }
      
      return Promise.reject({
        message: errorMessage,
        status: error.response.status,
        data: errorData,
      });
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({
        message: "Network error. Please check your connection and ensure the backend server is running.",
        status: 0,
      });
    } else {
      // Something else happened
      return Promise.reject({
        message: error.message || "An unexpected error occurred",
        status: 0,
      });
    }
  }
);

export default api;

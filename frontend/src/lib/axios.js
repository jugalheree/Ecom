import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:2000",
});

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem("auth");

  if (raw) {
    const auth = JSON.parse(raw);
    if (auth.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }
  }

  return config;
});

export default api;
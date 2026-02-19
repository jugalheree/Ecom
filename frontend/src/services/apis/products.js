import api from "../api";

export const fetchProducts = () =>
  api.get("/api/products");

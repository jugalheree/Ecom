import api from "../api";

// ─────────────── AUTH ───────────────
export const authAPI = {
  register: (data) => api.post("/api/auth/register", data),
  login: (data) => api.post("/api/auth/login", data),
  logout: () => api.post("/api/auth/logout"),
  refreshToken: (data) => api.post("/api/auth/refresh-token", data),
};

// ─────────────── USER ───────────────
export const userAPI = {
  createAddress: (data) => api.post("/api/user/address", data),
};

// ─────────────── VENDOR ───────────────
export const vendorAPI = {
  createProfile: (data) => api.post("/api/vendor/create-profile", data),
  attachAddress: (vendorId, data) =>
    api.post(`/api/vendor/${vendorId}/address`, data),
  uploadDocuments: (formData) =>
    api.post("/api/vendor/verification/documents", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  createProduct: (data) => api.post("/api/vendor/products", data),
  addProductAttributes: (productId, data) =>
    api.post(`/api/vendor/products/${productId}/attributes`, data),
  uploadProductImages: (productId, formData) =>
    api.post(`/api/vendor/products/${productId}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  products: () => api.get("/api/vendor/products"),

  // ── Vendor Orders ──
  getOrders: (params) => api.get("/api/vendor/orders", { params }),
  shipOrder: (orderId, data) =>
    api.patch(`/api/vendor/orders/${orderId}/ship`, data),
  reviewReturn: (returnId, data) =>
    api.patch(`/api/vendor/orders/returns/${returnId}/review`, data),
  markReturnPickedUp: (returnId) =>
    api.patch(`/api/vendor/orders/returns/${returnId}/pickup`),
  markReturnReceived: (returnId) =>
    api.patch(`/api/vendor/orders/returns/${returnId}/receive`),
  refundReturn: (returnId, data) =>
    api.patch(`/api/vendor/orders/returns/${returnId}/refund`, data),

  // NOTE: updateProduct, deleteProduct, updateStock endpoints do not exist in the current backend.
  updateProduct: (productId, data) =>
    api.patch(`/api/vendor/products/${productId}`, data),
  deleteProduct: (productId) =>
    api.delete(`/api/vendor/products/${productId}`),
  updateStock: (productId, change) =>
    api.patch(`/api/vendor/products/${productId}/stock`, { change }),
};

// ─────────────── CART ───────────────
export const cartAPI = {
  getCart: () => api.get("/api/cart"),
  addToCart: (data) => api.post("/api/cart/add", data),
  updateQuantity: (data) => api.patch("/api/cart/update", data),
  removeFromCart: (productId) => api.delete(`/api/cart/${productId}`),
};

// ─────────────── ORDERS (Buyer) ───────────────
export const orderAPI = {
  placeOrder: (data) => api.post("/api/orders/place", data),
  payOrder: (orderId) => api.post(`/api/orders/place/${orderId}/pay`),
  getMyOrders: (params) => api.get("/api/orders/my-orders", { params }),
  getOrderDetails: (orderId) => api.get(`/api/orders/my-orders/${orderId}`),
  confirmDelivery: (orderId, data) =>
    api.patch(`/api/orders/my-orders/${orderId}/confirm-delivery`, data),
  cancelOrder: (orderId) =>
    api.patch(`/api/orders/my-orders/${orderId}/cancel`),
  requestReturn: (orderId, formData) =>
    api.post(`/api/orders/my-orders/${orderId}/return`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getOrderTimeline: (orderId) =>
    api.get(`/api/orders/my-orders/${orderId}/timeline`),
};

// ─────────────── ADMIN ───────────────
export const adminAPI = {
  getPendingVendors: (params) =>
    api.get("/api/admin/vendors/pending", { params }),
  approveVendor: (vendorId) =>
    api.patch(`/api/admin/vendors/${vendorId}/approve`),
  rejectVendor: (vendorId, data) =>
    api.patch(`/api/admin/vendors/${vendorId}/reject`, data),
  getPendingProducts: (params) =>
    api.get("/api/admin/products/pending", { params }),
  approveProduct: (productId) =>
    api.patch(`/api/admin/products/${productId}/approve`),
  rejectProduct: (productId, data) =>
    api.patch(`/api/admin/products/${productId}/reject`, data),
};

// ─────────────── CATEGORIES ───────────────
export const categoryAPI = {
  getAll: () => api.get("/api/categories"),
  create: (data) => api.post("/api/categories/create-category", data),
  getAttributes: (categoryId) =>
    api.get(`/api/categories/${categoryId}/attributes`),
  createAttribute: (categoryId, data) =>
    api.post(`/api/categories/${categoryId}/attributes`, data),
};

// ─────────────── MARKETPLACE ───────────────
export const marketplaceAPI = {
  getCategoryTree: () => api.get("/api/marketplace/categories/tree"),
  getProductsByCategory: (categoryId, params) =>
    api.get(`/api/marketplace/categories/${categoryId}/products`, { params }),
  getProductDetails: (productId) =>
    api.get(`/api/marketplace/products/${productId}`),
};

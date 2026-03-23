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
<<<<<<< HEAD
  products: () => api.get("/api/vendor/products"),
=======
  products: (params) => api.get("/api/vendor/products", { params }),
>>>>>>> b1d2a068b48b187ba11dd8d1429f74b415f5cfb0

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

<<<<<<< HEAD
  // NOTE: updateProduct, deleteProduct, updateStock endpoints do not exist in the current backend.
=======
>>>>>>> b1d2a068b48b187ba11dd8d1429f74b415f5cfb0
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
<<<<<<< HEAD
  getProductDetails: (productId) =>
    api.get(`/api/marketplace/products/${productId}`),
=======
  getCategoryFilters: (categoryId) =>
    api.get(`/api/marketplace/categories/${categoryId}/filters`),
  getProductDetails: (productId) =>
    api.get(`/api/marketplace/products/${productId}`),
  getSimilarProducts: (productId) =>
    api.get(`/api/marketplace/products/${productId}/similar`),
  searchProducts: (params) =>
    api.get("/api/marketplace/search/products", { params }),
  getSearchSuggestions: (q) =>
    api.get("/api/marketplace/search/suggestions", { params: { q } }),
  getMarketplaceProducts: (params) =>
    api.get("/api/marketplace/products", { params }),
};

// ─────────────── VENDOR MARKETPLACE ───────────────
export const vendorMarketplaceAPI = {
  // Browse listings (all vendors)
  getListings: (params) => api.get("/api/vendor-marketplace/listings", { params }),
  getListingById: (id) => api.get(`/api/vendor-marketplace/listings/${id}`),
  getStats: () => api.get("/api/vendor-marketplace/stats"),

  // My listings
  getMyListings: (params) => api.get("/api/vendor-marketplace/my-listings", { params }),

  // CRUD
  createListing: (data) => api.post("/api/vendor-marketplace/listings", data),
  updateListing: (id, data) => api.patch(`/api/vendor-marketplace/listings/${id}`, data),
  deleteListing: (id) => api.delete(`/api/vendor-marketplace/listings/${id}`),

  // Contact
  contactVendor: (id, data) => api.post(`/api/vendor-marketplace/listings/${id}/contact`, data),
>>>>>>> b1d2a068b48b187ba11dd8d1429f74b415f5cfb0
};

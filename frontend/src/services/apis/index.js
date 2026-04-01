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
  getAddresses:  ()     => api.get("/api/user/address"),
  deleteAddress: (id)   => api.delete(`/api/user/address/${id}`),
};

// ─────────────── VENDOR ───────────────
export const vendorAPI = {
  getProfile: () => api.get("/api/vendor/me"),
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
  products: (params) => api.get("/api/vendor/products", { params }),

  // ── Vendor Orders ──
  getOrders: (params) => api.get("/api/vendor/orders", { params }),
  getReturns: (params) => api.get("/api/vendor/orders/returns", { params }),
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

  updateProduct: (productId, data) =>
    api.patch(`/api/vendor/products/${productId}`, data),
  deleteProduct: (productId) =>
    api.delete(`/api/vendor/products/${productId}`),
  updateStock: (productId, change) =>
    api.patch(`/api/vendor/products/${productId}/stock`, { change }),

  // ── Bank account & Payouts ──
  getBankAccount:  ()     => api.get("/api/vendor/bank-account"),
  saveBankAccount: (data) => api.post("/api/vendor/bank-account", data),
  requestPayout:   (amount) => api.post("/api/vendor/payouts", { amount }),
  getPayoutHistory: ()    => api.get("/api/vendor/payouts"),

  // ── Delivery Staff Management ──
  getDeliveryStaff:       ()           => api.get("/api/vendor/delivery-staff"),
  addDeliveryStaff:       (data)       => api.post("/api/vendor/delivery-staff", data),
  updateDeliveryStaff:    (id, data)   => api.patch(`/api/vendor/delivery-staff/${id}`, data),
  deleteDeliveryStaff:    (id)         => api.delete(`/api/vendor/delivery-staff/${id}`),
  getDeliveryAssignments: ()           => api.get("/api/vendor/delivery-assignments"),
  assignDelivery:         (data)       => api.post("/api/vendor/delivery-assignments/assign", data),
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
  // Vendors
  getPendingVendors: (params) => api.get("/api/admin/vendors/pending", { params }),
  getAllVendors: (params) => api.get("/api/admin/vendors", { params }),
  getVendorDetails: (vendorId) => api.get(`/api/admin/vendors/${vendorId}`),
  approveVendor: (vendorId) => api.patch(`/api/admin/vendors/${vendorId}/approve`),
  rejectVendor: (vendorId, data) => api.patch(`/api/admin/vendors/${vendorId}/reject`, data),
  // Products
  getPendingProducts: (params) => api.get("/api/admin/products/pending", { params }),
  getProductDetails: (productId) => api.get(`/api/admin/products/${productId}`),
  approveProduct: (productId) => api.patch(`/api/admin/products/${productId}/approve`),
  rejectProduct: (productId, data) => api.patch(`/api/admin/products/${productId}/reject`, data),
  // Orders
  getAllOrders: (params) => api.get("/api/admin/orders", { params }),
  // Returns
  getAllReturns: (params) => api.get("/api/admin/returns", { params }),
  refundReturn: (returnId, data) => api.patch(`/api/admin/returns/${returnId}/refund`, data),
  // Users
  getAllUsers: (params) => api.get("/api/admin/users", { params }),
  getUserDetails: (userId) => api.get(`/api/admin/users/${userId}`),
  toggleBlockUser: (userId) => api.patch(`/api/admin/users/${userId}/toggle-block`),
  // Dashboard
  getDashboard: () => api.get("/api/admin/dashboard"),
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

// ─────────────── WALLET ───────────────
export const walletAPI = {
  getWallet: () => api.get("/api/wallet"),
  addMoney: (amount) => api.post("/api/wallet/add", { amount }),
  withdraw: (amount) => api.post("/api/wallet/withdraw", { amount }),
  getTransactions: (params) => api.get("/api/wallet/transactions", { params }),
};

// ─────────────── DELIVERY ASSIGNMENTS ───────────────
export const assignmentAPI = {
  // Admin
  getStaff:      ()       => api.get("/api/assignments/staff"),
  assign:        (data)   => api.post("/api/assignments/assign", data),
  getAll:        (params) => api.get("/api/assignments/all", { params }),
  // Delivery person
  getMy:         (params) => api.get("/api/assignments/my", { params }),
  updateStatus:  (id, data) => api.patch(`/api/assignments/${id}/status`, data),
  // Vendor
  getVendorUpdates: () => api.get("/api/assignments/vendor-updates"),
  updateLocation: (data) => api.post("/api/assignments/location", data),
};

// ─────────────── DEALS ───────────────
export const dealAPI = {
  propose:    (data)      => api.post("/api/deals", data),
  getMy:      (params)    => api.get("/api/deals/my", { params }),
  getById:    (id)        => api.get(`/api/deals/${id}`),
  respond:    (id, data)  => api.patch(`/api/deals/${id}/respond`, data),
  sign:       (id)        => api.patch(`/api/deals/${id}/sign`),
  complete:   (id)        => api.patch(`/api/deals/${id}/complete`),
  break:      (id, data)  => api.patch(`/api/deals/${id}/break`, data),
  sendMessage:(id, data)  => api.post(`/api/deals/${id}/message`, data),
};

// ─────────────── RATINGS ───────────────
export const ratingAPI = {
  submit: (data) => api.post("/api/ratings", data),
  getProductRatings: (productId, params) => api.get(`/api/ratings/product/${productId}`, { params }),
  getVendorRatings: (vendorId, params) => api.get(`/api/ratings/vendor/${vendorId}`, { params }),
  getMyRatings: () => api.get("/api/ratings/my"),
};

// ─────────────── DISPUTES ───────────────
export const disputeAPI = {
  raise: (data) => api.post("/api/disputes", data),
  getMy: () => api.get("/api/disputes/my"),
  getAll: (params) => api.get("/api/disputes/admin", { params }),
  resolve: (id, data) => api.patch(`/api/disputes/admin/${id}/resolve`, data),
};

// ─────────────── MARKETPLACE ───────────────
export const marketplaceAPI = {
  getCategoryTree: () => api.get("/api/marketplace/categories/tree"),
  getProductsByCategory: (categoryId, params) =>
    api.get(`/api/marketplace/categories/${categoryId}/products`, { params }),
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
  getVendorPublicProfile: (vendorId) =>
    api.get(`/api/marketplace/vendors/${vendorId}`),
};

// ─────────────── VENDOR MARKETPLACE ───────────────
export const vendorMarketplaceAPI = {
  // Browse listings (all vendors)
  getListings: (params) => api.get("/api/vendor-marketplace/listings", { params }),
  getListingById: (id) => api.get(`/api/vendor-marketplace/listings/${id}`),
  getStats: () => api.get("/api/vendor-marketplace/stats"),
  getCategories: () => api.get("/api/vendor-marketplace/categories"),

  // My listings
  getMyListings: (params) => api.get("/api/vendor-marketplace/my-listings", { params }),

  // CRUD
  createListing: (data) => api.post("/api/vendor-marketplace/listings", data),
  updateListing: (id, data) => api.patch(`/api/vendor-marketplace/listings/${id}`, data),
  deleteListing: (id) => api.delete(`/api/vendor-marketplace/listings/${id}`),

  // Contact
  contactVendor: (id, data) => api.post(`/api/vendor-marketplace/listings/${id}/contact`, data),
};

// ─────────────── COUPONS ───────────────
export const couponAPI = {
  validate: (code, orderTotal) => api.post("/api/coupons/validate", { code, orderTotal }),
  // Admin
  list:     ()         => api.get("/api/coupons"),
  create:   (data)     => api.post("/api/coupons", data),
  toggle:   (id)       => api.patch(`/api/coupons/${id}/toggle`),
  remove:   (id)       => api.delete(`/api/coupons/${id}`),
};

// ─────────────── LOCATION (Ola Maps) ───────────────
export const locationAPI = {
  autocomplete: (query, lat, lng) =>
    api.get("/api/location/autocomplete", {
      params: { q: query, lat, lng },
    }),

  geocodePlaceId: (placeId) =>
    api.get("/api/location/geocode", { params: { placeId } }),

  reverseGeocode: (lat, lng) =>
    api.get("/api/location/reverse-geocode", { params: { lat, lng } }),

  saveBuyerLocation: (data) =>
    api.post("/api/location/buyer/delivery-location", data),

  getMyAddresses: () => api.get("/api/location/my-addresses"),

  getNearbyProducts: (params) =>
    api.get("/api/location/nearby-products", { params }),
};

// ─────────────── REFERRAL ───────────────
export const referralAPI = {
  getMyCode:    ()     => api.get("/api/referral/my-code"),
  applyCode:    (code) => api.post("/api/referral/apply", { code }),
  getHistory:   ()     => api.get("/api/referral/history"),
};

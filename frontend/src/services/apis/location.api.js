// ─────────────────────────────────────────────────────────────────────────────
// ADD THIS BLOCK to your existing src/services/apis/index.js
// Paste it at the bottom of the file (before the last line if any)
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────── LOCATION (Ola Maps) ───────────────
export const locationAPI = {
  /**
   * Get autocomplete suggestions from Ola Maps
   * @param {string} query - search text
   * @param {number} lat   - optional bias lat
   * @param {number} lng   - optional bias lng
   */
  autocomplete: (query, lat, lng) =>
    api.get("/api/location/autocomplete", {
      params: { q: query, lat, lng },
    }),

  /**
   * Geocode a placeId → { lat, lng, formattedAddress, area, city, state, pincode, ... }
   * @param {string} placeId - Ola Maps place_id from autocomplete
   */
  geocodePlaceId: (placeId) =>
    api.get("/api/location/geocode", { params: { placeId } }),

  /**
   * Reverse geocode lat/lng → address object
   */
  reverseGeocode: (lat, lng) =>
    api.get("/api/location/reverse-geocode", { params: { lat, lng } }),

  /**
   * Save buyer's delivery location (creates or updates address with coordinates)
   */
  saveBuyerLocation: (data) =>
    api.post("/api/location/buyer/delivery-location", data),

  /**
   * Get buyer's saved addresses
   */
  getMyAddresses: () => api.get("/api/location/my-addresses"),

  /**
   * Fetch products from vendors within a given radius of the buyer
   * @param {object} params - { lat, lng, radius, page, limit, sort, categoryId, saleType }
   */
  getNearbyProducts: (params) =>
    api.get("/api/location/nearby-products", { params }),
};

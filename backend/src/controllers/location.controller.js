import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Address } from "../models/user/Address.model.js";
import { Vendor } from "../models/vendor/Vendor.model.js";
import { Product } from "../models/product/Product.model.js";
import { ProductImage } from "../models/product/ProductImage.model.js";

const OLA_API_KEY = process.env.OLA_MAPS_API_KEY;
const OLA_BASE_URL = "https://api.olamaps.io";

// ─────────────────────────────────────────────
// Helper: Haversine distance (km) between two lat/lng points
// ─────────────────────────────────────────────
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ─────────────────────────────────────────────
// Ola Maps: Autocomplete suggestions
// GET /api/location/autocomplete?q=<text>&lat=<>&lng=<>
// ─────────────────────────────────────────────
export const getAutocompleteSuggestions = asyncHandler(async (req, res) => {
  const { q, lat, lng } = req.query;

  if (!q || q.trim().length < 2) {
    throw new ApiError(400, "Query must be at least 2 characters");
  }

  if (!OLA_API_KEY) {
    throw new ApiError(500, "Ola Maps API key not configured");
  }

  const params = new URLSearchParams({
    input: q.trim(),
    api_key: OLA_API_KEY,
  });

  // Bias results toward user's current location if provided
  if (lat && lng) {
    params.append("location", `${lat},${lng}`);
  }

  const response = await fetch(
    `${OLA_BASE_URL}/places/v1/autocomplete?${params.toString()}`
  );

  if (!response.ok) {
    const errText = await response.text();
    console.error("Ola Autocomplete error:", errText);
    throw new ApiError(502, "Failed to fetch suggestions from Ola Maps");
  }

  const data = await response.json();

  // Normalize predictions into a clean shape
  const suggestions = (data.predictions || []).map((p) => ({
    placeId: p.place_id,
    description: p.description,
    mainText: p.structured_formatting?.main_text || p.description,
    secondaryText: p.structured_formatting?.secondary_text || "",
  }));

  return res
    .status(200)
    .json(new ApiResponse(200, suggestions, "Suggestions fetched"));
});

// ─────────────────────────────────────────────
// Ola Maps: Geocode a place_id to coordinates
// GET /api/location/geocode?placeId=<>
// ─────────────────────────────────────────────
export const geocodePlaceId = asyncHandler(async (req, res) => {
  const { placeId } = req.query;

  if (!placeId) {
    throw new ApiError(400, "placeId is required");
  }

  if (!OLA_API_KEY) {
    throw new ApiError(500, "Ola Maps API key not configured");
  }

  const params = new URLSearchParams({
    place_id: placeId,
    api_key: OLA_API_KEY,
  });

  const response = await fetch(
    `${OLA_BASE_URL}/places/v1/details?${params.toString()}`
  );

  if (!response.ok) {
    const errText = await response.text();
    console.error("Ola Geocode error:", errText);
    throw new ApiError(502, "Failed to geocode location from Ola Maps");
  }

  const data = await response.json();
  const result = data.result;

  if (!result || !result.geometry) {
    throw new ApiError(404, "Location details not found");
  }

  const { lat, lng } = result.geometry.location;

  // Parse address components
  const components = result.address_components || [];
  const get = (type) =>
    components.find((c) => c.types?.includes(type))?.long_name || "";

  const parsed = {
    lat,
    lng,
    formattedAddress: result.formatted_address || "",
    buildingNameOrNumber: get("premise") || get("subpremise") || "",
    area: get("sublocality_level_1") || get("sublocality") || get("neighborhood") || "",
    city: get("locality") || get("administrative_area_level_2") || "",
    state: get("administrative_area_level_1") || "",
    country: get("country") || "India",
    pincode: get("postal_code") || "",
  };

  return res
    .status(200)
    .json(new ApiResponse(200, parsed, "Location geocoded successfully"));
});

// ─────────────────────────────────────────────
// Ola Maps: Reverse geocode lat/lng to address
// GET /api/location/reverse-geocode?lat=<>&lng=<>
// ─────────────────────────────────────────────
export const reverseGeocode = asyncHandler(async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    throw new ApiError(400, "lat and lng are required");
  }

  if (!OLA_API_KEY) {
    throw new ApiError(500, "Ola Maps API key not configured");
  }

  const params = new URLSearchParams({
    latlng: `${lat},${lng}`,
    api_key: OLA_API_KEY,
  });

  const response = await fetch(
    `${OLA_BASE_URL}/places/v1/reverse-geocode?${params.toString()}`
  );

  if (!response.ok) {
    const errText = await response.text();
    console.error("Ola Reverse Geocode error:", errText);
    throw new ApiError(502, "Failed to reverse geocode from Ola Maps");
  }

  const data = await response.json();
  const result = data.results?.[0];

  if (!result) {
    throw new ApiError(404, "No address found for these coordinates");
  }

  const components = result.address_components || [];
  const get = (type) =>
    components.find((c) => c.types?.includes(type))?.long_name || "";

  const parsed = {
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    formattedAddress: result.formatted_address || "",
    buildingNameOrNumber: get("premise") || get("subpremise") || "",
    area: get("sublocality_level_1") || get("sublocality") || get("neighborhood") || "",
    city: get("locality") || get("administrative_area_level_2") || "",
    state: get("administrative_area_level_1") || "",
    country: get("country") || "India",
    pincode: get("postal_code") || "",
  };

  return res
    .status(200)
    .json(new ApiResponse(200, parsed, "Reverse geocoded successfully"));
});

// ─────────────────────────────────────────────
// Save buyer's delivery location (lat/lng + address)
// POST /api/location/buyer/delivery-location
// Body: { addressId, lat, lng } OR full address fields + lat/lng
// ─────────────────────────────────────────────
export const saveBuyerLocation = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const {
    addressId,
    lat,
    lng,
    buildingNameOrNumber,
    landmark,
    area,
    city,
    state,
    country = "India",
    pincode,
    addressType = "HOME",
  } = req.body;

  if (!lat || !lng) {
    throw new ApiError(400, "lat and lng are required");
  }

  let address;

  if (addressId) {
    // Update existing address with coordinates
    address = await Address.findOneAndUpdate(
      { _id: addressId, userId },
      { "location.lat": parseFloat(lat), "location.lng": parseFloat(lng) },
      { new: true }
    );
    if (!address) throw new ApiError(404, "Address not found");
  } else {
    // Create new address with coordinates
    if (!buildingNameOrNumber || !area || !city || !state || !pincode) {
      throw new ApiError(400, "All address fields are required");
    }

    address = await Address.create({
      userId,
      addressType,
      buildingNameOrNumber,
      landmark,
      area,
      city,
      state,
      country,
      pincode,
      location: { lat: parseFloat(lat), lng: parseFloat(lng) },
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, address, "Delivery location saved"));
});

// ─────────────────────────────────────────────
// Get nearby products filtered by vendor-buyer distance
// GET /api/location/nearby-products?lat=<>&lng=<>&radius=<km>&page=<>&limit=<>
// ─────────────────────────────────────────────
export const getNearbyProducts = asyncHandler(async (req, res) => {
  let {
    lat,
    lng,
    radius = 10, // default 10 km
    page = 1,
    limit = 20,
    categoryId,
    minPrice,
    maxPrice,
    sort = "distance", // "distance" | "newest" | "price_low_high" | "price_high_low"
    saleType,
  } = req.query;

  if (!lat || !lng) {
    throw new ApiError(400, "lat and lng are required to show nearby products");
  }

  lat = parseFloat(lat);
  lng = parseFloat(lng);
  radius = parseFloat(radius);
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 20;

  if (isNaN(lat) || isNaN(lng)) {
    throw new ApiError(400, "Invalid coordinates");
  }

  // Step 1: Find all vendors with at least one address that has coordinates
  const addresses = await Address.find({
    "location.lat": { $exists: true, $ne: null },
    "location.lng": { $exists: true, $ne: null },
  })
    .select("userId location")
    .lean();

  // Step 2: Filter addresses within radius using Haversine
  const nearbyAddresses = addresses.filter((addr) => {
    const dist = haversineDistance(
      lat,
      lng,
      addr.location.lat,
      addr.location.lng
    );
    return dist <= radius;
  });

  // Map userId → distance (take nearest address if multiple)
  const userDistanceMap = {};
  nearbyAddresses.forEach((addr) => {
    const uid = addr.userId.toString();
    const dist = haversineDistance(lat, lng, addr.location.lat, addr.location.lng);
    if (!userDistanceMap[uid] || dist < userDistanceMap[uid]) {
      userDistanceMap[uid] = dist;
    }
  });

  const nearbyUserIds = Object.keys(userDistanceMap);

  if (!nearbyUserIds.length) {
    return res.status(200).json(
      new ApiResponse(
        200,
        { products: [], pagination: { totalProducts: 0, currentPage: 1, totalPages: 0, limit }, radiusKm: radius },
        "No vendors found within the specified radius"
      )
    );
  }

  // Step 3: Find vendors whose userId is in nearby users
  const nearbyVendors = await Vendor.find({
    userId: { $in: nearbyUserIds },
    isActive: true,
  })
    .select("_id userId freeDeliveryDistanceKm deliveryChargePerKm shopName")
    .lean();

  const vendorIdToDistanceMap = {};
  const vendorIdToDeliveryInfo = {};

  nearbyVendors.forEach((vendor) => {
    const uid = vendor.userId.toString();
    const dist = userDistanceMap[uid] || 999;
    vendorIdToDistanceMap[vendor._id.toString()] = dist;
    vendorIdToDeliveryInfo[vendor._id.toString()] = {
      shopName: vendor.shopName,
      freeDeliveryDistanceKm: vendor.freeDeliveryDistanceKm,
      deliveryChargePerKm: vendor.deliveryChargePerKm,
      distanceKm: parseFloat(dist.toFixed(2)),
      deliveryCharge:
        dist <= vendor.freeDeliveryDistanceKm
          ? 0
          : parseFloat(
              ((dist - vendor.freeDeliveryDistanceKm) * vendor.deliveryChargePerKm).toFixed(2)
            ),
    };
  });

  const nearbyVendorIds = nearbyVendors.map((v) => v._id);

  // Step 4: Fetch products from nearby vendors
  const productFilter = {
    vendorId: { $in: nearbyVendorIds },
    approvalStatus: "APPROVED",
    isActive: true,
    stock: { $gt: 0 },
  };

  if (categoryId) productFilter.categoryId = categoryId;
  if (minPrice || maxPrice) {
    productFilter.price = {};
    if (minPrice) productFilter.price.$gte = Number(minPrice);
    if (maxPrice) productFilter.price.$lte = Number(maxPrice);
  }
  if (saleType) productFilter.saleType = { $in: [saleType, "BOTH"] };

  // Sorting (distance sort handled after fetch)
  let sortOption = { createdAt: -1 };
  if (sort === "price_low_high") sortOption = { price: 1 };
  else if (sort === "price_high_low") sortOption = { price: -1 };

  const totalProducts = await Product.countDocuments(productFilter);

  let products = await Product.find(productFilter)
    .sort(sortOption)
    .lean();

  // Attach distance info to each product
  products = products.map((p) => {
    const vid = p.vendorId.toString();
    const info = vendorIdToDeliveryInfo[vid] || {};
    return { ...p, _distanceKm: vendorIdToDistanceMap[vid] || 999, deliveryInfo: info };
  });

  // Sort by distance if requested
  if (sort === "distance") {
    products.sort((a, b) => a._distanceKm - b._distanceKm);
  }

  // Paginate manually (needed for distance sort)
  const paginatedProducts = products.slice((page - 1) * limit, page * limit);

  const productIds = paginatedProducts.map((p) => p._id);

  const images = await ProductImage.find({
    productId: { $in: productIds },
    isPrimary: true,
    isActive: true,
  }).lean();

  const imageMap = {};
  images.forEach((img) => {
    imageMap[img.productId.toString()] = img.imageUrl;
  });

  const result = paginatedProducts.map((p) => ({
    _id: p._id,
    title: p.title,
    price: p.price,
    slug: p.slug,
    image: imageMap[p._id.toString()] || null,
    distanceKm: parseFloat((p._distanceKm || 0).toFixed(2)),
    deliveryInfo: p.deliveryInfo,
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        products: result,
        pagination: {
          totalProducts,
          currentPage: page,
          totalPages: Math.ceil(totalProducts / limit),
          limit,
        },
        radiusKm: radius,
        buyerLocation: { lat, lng },
      },
      "Nearby products fetched successfully"
    )
  );
});

// ─────────────────────────────────────────────
// Get buyer's saved addresses with coordinates
// GET /api/location/my-addresses
// ─────────────────────────────────────────────
export const getMyAddresses = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const addresses = await Address.find({ userId }).lean();

  return res
    .status(200)
    .json(new ApiResponse(200, addresses, "Addresses fetched"));
});

// ─────────────────────────────────────────────────────────────────────────────
// ADD THIS TO THE BOTTOM of your existing marketplace.controller.js
// Also add the import for Address at the top:
//   import { Address } from "../models/user/Address.model.js";
// ─────────────────────────────────────────────────────────────────────────────

// Paste this block at the top of your marketplace.controller.js imports:
// import { Address } from "../models/user/Address.model.js";

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE getMarketplaceProducts to support optional location-based filtering
// Replace the existing getMarketplaceProducts with this version:
// ─────────────────────────────────────────────────────────────────────────────

/*
export const getMarketplaceProducts = asyncHandler(async (req, res) => {

  let {
    categoryId,
    minPrice,
    maxPrice,
    sort = "newest",
    page = 1,
    limit = 20,
    // NEW: location params
    lat,
    lng,
    radius, // in km; if provided, only show vendors within this radius
    saleType,
  } = req.query;

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 20;

  const filter = {
    approvalStatus: "APPROVED",
    isActive: true,
    stock: { $gt: 0 }
  };

  if (saleType) {
    filter.saleType = { $in: [saleType, "BOTH"] };
  }

  if (categoryId) {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      throw new ApiError(400, "Invalid categoryId");
    }
    filter.categoryId = categoryId;
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // ── Location filtering ──
  if (lat && lng && radius) {
    const buyerLat = parseFloat(lat);
    const buyerLng = parseFloat(lng);
    const radiusKm = parseFloat(radius);

    // Get all addresses with coordinates
    const addresses = await Address.find({
      "location.lat": { $exists: true, $ne: null },
      "location.lng": { $exists: true, $ne: null },
    }).select("userId location").lean();

    // Filter by distance (Haversine)
    function haversineDistance(lat1, lng1, lat2, lng2) {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLng = ((lng2 - lng1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    const nearbyUserIds = addresses
      .filter((a) => haversineDistance(buyerLat, buyerLng, a.location.lat, a.location.lng) <= radiusKm)
      .map((a) => a.userId.toString());

    const nearbyVendors = await Vendor.find({
      userId: { $in: nearbyUserIds },
      isActive: true,
    }).select("_id").lean();

    filter.vendorId = { $in: nearbyVendors.map((v) => v._id) };
  }

  let sortOption = {};
  switch (sort) {
    case "price_low_high": sortOption = { price: 1 }; break;
    case "price_high_low": sortOption = { price: -1 }; break;
    default: sortOption = { createdAt: -1 };
  }

  const totalProducts = await Product.countDocuments(filter);

  const products = await Product.find(filter)
    .sort(sortOption)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const productIds = products.map(p => p._id);

  const images = await ProductImage.find({
    productId: { $in: productIds },
    isPrimary: true,
    isActive: true
  }).lean();

  const imageMap = {};
  images.forEach(img => {
    imageMap[img.productId.toString()] = img.imageUrl;
  });

  const result = products.map(p => ({
    _id: p._id,
    title: p.title,
    price: p.price,
    slug: p.slug,
    image: imageMap[p._id.toString()] || null
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
          limit
        }
      },
      "Marketplace products fetched successfully"
    )
  );
});
*/

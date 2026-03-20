import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { VendorMarketplaceListing } from "../models/vendor/VendorMarketplaceListing.model.js";
import { Vendor } from "../models/vendor/Vendor.model.js";
import { Product } from "../models/product/Product.model.js";
import { ProductImage } from "../models/product/ProductImage.model.js";

// ─── Helper: compute dynamic discount based on expiry date ──────────────────
const computeExpiryDiscount = (expiryDate, basePrice) => {
  if (!expiryDate) return { discountPercent: 0, discountedPrice: basePrice };

  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

  let discountPercent = 0;

  if (daysLeft <= 0) {
    discountPercent = 80; // Expired — max discount
  } else if (daysLeft <= 7) {
    discountPercent = 70; // ≤ 7 days
  } else if (daysLeft <= 14) {
    discountPercent = 55; // ≤ 14 days
  } else if (daysLeft <= 30) {
    discountPercent = 40; // ≤ 30 days
  } else if (daysLeft <= 60) {
    discountPercent = 25; // ≤ 60 days
  } else if (daysLeft <= 90) {
    discountPercent = 15; // ≤ 90 days
  }

  const discountedPrice =
    discountPercent > 0
      ? Math.round(basePrice * (1 - discountPercent / 100))
      : basePrice;

  return { discountPercent, discountedPrice, daysLeft };
};

// ─── GET /api/vendor-marketplace/listings ────────────────────────────────────
// List all active marketplace listings (accessible to all vendors)
export const getMarketplaceListings = asyncHandler(async (req, res) => {
  let {
    page = 1,
    limit = 20,
    listingType, // "NEW" | "SURPLUS"
    search,
    sort = "newest",
    minPrice,
    maxPrice,
  } = req.query;

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 20;

  const filter = { isActive: true, stock: { $gt: 0 } };

  if (listingType && ["NEW", "SURPLUS"].includes(listingType)) {
    filter.listingType = listingType;
  }

  if (minPrice || maxPrice) {
    filter.discountedPrice = {};
    if (minPrice) filter.discountedPrice.$gte = parseFloat(minPrice);
    if (maxPrice) filter.discountedPrice.$lte = parseFloat(maxPrice);
  }

  // Sorting
  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    price_asc: { discountedPrice: 1 },
    price_desc: { discountedPrice: -1 },
    discount: { discountPercent: -1 },
    expiry: { expiryDate: 1 }, // soonest expiry first
  };
  const sortObj = sortMap[sort] || sortMap.newest;

  const skip = (page - 1) * limit;

  // Build pipeline
  let pipeline = [
    { $match: filter },
    {
      $lookup: {
        from: "vendors",
        localField: "vendorId",
        foreignField: "_id",
        as: "vendor",
      },
    },
    { $unwind: { path: "$vendor", preserveNullAndEmptyArrays: false } },
    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "productimages",
        let: { pid: "$productId" },
        pipeline: [
          { $match: { $expr: { $eq: ["$productId", "$$pid"] }, isPrimary: true } },
          { $limit: 1 },
        ],
        as: "primaryImage",
      },
    },
    {
      $unwind: { path: "$primaryImage", preserveNullAndEmptyArrays: true },
    },
  ];

  // Search on title
  if (search) {
    pipeline.push({
      $match: {
        $or: [
          { title: { $regex: new RegExp(search, "i") } },
          { "vendor.shopName": { $regex: new RegExp(search, "i") } },
        ],
      },
    });
  }

  // Project
  pipeline.push({
    $project: {
      _id: 1,
      listingType: 1,
      title: 1,
      description: 1,
      originalPrice: 1,
      discountedPrice: 1,
      discountPercent: 1,
      stock: 1,
      unit: 1,
      expiryDate: 1,
      manufacturingDate: 1,
      reason: 1,
      condition: 1,
      contactInfo: 1,
      inquiryCount: 1,
      createdAt: 1,
      vendor: {
        _id: "$vendor._id",
        shopName: "$vendor.shopName",
        businessType: "$vendor.businessType",
      },
      productId: 1,
      primaryImage: { imageUrl: "$primaryImage.imageUrl" },
    },
  });

  pipeline.push({ $sort: sortObj });

  // Count total
  const countPipeline = [...pipeline, { $count: "total" }];
  const countResult = await VendorMarketplaceListing.aggregate(countPipeline);
  const total = countResult[0]?.total || 0;

  pipeline.push({ $skip: skip }, { $limit: limit });

  const listings = await VendorMarketplaceListing.aggregate(pipeline);

  // Enrich with live expiry discount (if expiryDate changed since listing)
  const enriched = listings.map((item) => {
    if (item.listingType === "SURPLUS" && item.expiryDate) {
      const { discountPercent, discountedPrice, daysLeft } =
        computeExpiryDiscount(item.expiryDate, item.originalPrice);
      return {
        ...item,
        discountPercent,
        discountedPrice,
        daysUntilExpiry: daysLeft,
      };
    }
    const daysLeft = item.expiryDate
      ? Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
      : null;
    return { ...item, daysUntilExpiry: daysLeft };
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        listings: enriched,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Marketplace listings fetched successfully"
    )
  );
});

// ─── GET /api/vendor-marketplace/listings/:id ────────────────────────────────
export const getListingById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid listing ID");
  }

  const listing = await VendorMarketplaceListing.findOne({
    _id: id,
    isActive: true,
  })
    .populate("vendorId", "shopName businessType")
    .populate("productId", "title price stock categoryId")
    .lean();

  if (!listing) {
    throw new ApiError(404, "Listing not found");
  }

  // Get primary image
  const primaryImage = await ProductImage.findOne({
    productId: listing.productId,
    isPrimary: true,
  }).lean();

  // Enrich with live expiry discount
  let enriched = { ...listing };
  if (listing.listingType === "SURPLUS" && listing.expiryDate) {
    const { discountPercent, discountedPrice, daysLeft } = computeExpiryDiscount(
      listing.expiryDate,
      listing.originalPrice
    );
    enriched.discountPercent = discountPercent;
    enriched.discountedPrice = discountedPrice;
    enriched.daysUntilExpiry = daysLeft;
  } else if (listing.expiryDate) {
    enriched.daysUntilExpiry = Math.ceil(
      (new Date(listing.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
    );
  }

  enriched.primaryImage = primaryImage ? { imageUrl: primaryImage.imageUrl } : null;

  return res
    .status(200)
    .json(new ApiResponse(200, enriched, "Listing fetched successfully"));
});

// ─── POST /api/vendor-marketplace/listings ───────────────────────────────────
// Vendor creates a new marketplace listing
export const createListing = asyncHandler(async (req, res) => {
  // req.vendor is attached by isVendorApproved middleware (already validated)
  const vendor = req.vendor || await Vendor.findOne({ userId: req.user._id, isActive: true }).lean();
  if (!vendor) {
    throw new ApiError(403, "Vendor profile not found or not active");
  }

  const {
    productId,
    listingType = "NEW",
    title,
    description,
    originalPrice,
    discountedPrice,
    stock,
    unit,
    expiryDate,
    manufacturingDate,
    reason,
    condition = "NEW",
    contactInfo,
  } = req.body;

  // Validate
  if (!productId || !title || !originalPrice || !discountedPrice || !stock) {
    throw new ApiError(
      400,
      "productId, title, originalPrice, discountedPrice, and stock are required"
    );
  }

  if (!["NEW", "SURPLUS"].includes(listingType)) {
    throw new ApiError(400, "listingType must be NEW or SURPLUS");
  }

  if (listingType === "SURPLUS" && !reason) {
    throw new ApiError(400, "Reason is required for SURPLUS listings");
  }

  // Verify product belongs to this vendor
  if (!mongoose.isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid productId");
  }

  const product = await Product.findOne({
    _id: productId,
    vendorId: vendor._id,
    isActive: true,
  }).lean();

  if (!product) {
    throw new ApiError(
      404,
      "Product not found or does not belong to this vendor"
    );
  }

  // If SURPLUS + expiryDate provided, auto-compute discounted price
  let finalDiscountedPrice = parseFloat(discountedPrice);
  let finalDiscountPercent = 0;

  if (listingType === "SURPLUS" && expiryDate) {
    const { discountPercent, discountedPrice: computedPrice } =
      computeExpiryDiscount(new Date(expiryDate), parseFloat(originalPrice));
    // Use the higher of vendor-set or auto-computed discount
    if (computedPrice < finalDiscountedPrice) {
      finalDiscountedPrice = computedPrice;
    }
    finalDiscountPercent = Math.round(
      ((parseFloat(originalPrice) - finalDiscountedPrice) /
        parseFloat(originalPrice)) *
        100
    );
  } else {
    finalDiscountPercent = Math.round(
      ((parseFloat(originalPrice) - finalDiscountedPrice) /
        parseFloat(originalPrice)) *
        100
    );
  }

  const listing = await VendorMarketplaceListing.create({
    vendorId: vendor._id,
    productId,
    listingType,
    title: title.trim(),
    description: description?.trim(),
    originalPrice: parseFloat(originalPrice),
    discountedPrice: finalDiscountedPrice,
    discountPercent: finalDiscountPercent,
    stock: parseInt(stock),
    unit: unit || product.unit || "piece",
    expiryDate: expiryDate ? new Date(expiryDate) : null,
    manufacturingDate: manufacturingDate ? new Date(manufacturingDate) : null,
    reason: reason?.trim(),
    condition,
    contactInfo: contactInfo?.trim(),
    isActive: true,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, listing, "Listing created successfully"));
});

// ─── PATCH /api/vendor-marketplace/listings/:id ──────────────────────────────
// Vendor updates their own listing
export const updateListing = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid listing ID");
  }

  const vendor = req.vendor || await Vendor.findOne({ userId }).lean();
  if (!vendor) throw new ApiError(403, "Vendor profile not found");

  const listing = await VendorMarketplaceListing.findOne({
    _id: id,
    vendorId: vendor._id,
  });
  if (!listing) throw new ApiError(404, "Listing not found");

  const allowedFields = [
    "title",
    "description",
    "discountedPrice",
    "stock",
    "unit",
    "expiryDate",
    "manufacturingDate",
    "reason",
    "condition",
    "contactInfo",
    "isActive",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      listing[field] = req.body[field];
    }
  });

  // Recompute discount if price changed
  if (listing.listingType === "SURPLUS" && listing.expiryDate) {
    const { discountPercent, discountedPrice } = computeExpiryDiscount(
      listing.expiryDate,
      listing.originalPrice
    );
    if (discountedPrice < listing.discountedPrice) {
      listing.discountedPrice = discountedPrice;
    }
    listing.discountPercent = Math.round(
      ((listing.originalPrice - listing.discountedPrice) /
        listing.originalPrice) *
        100
    );
  } else {
    listing.discountPercent = Math.round(
      ((listing.originalPrice - listing.discountedPrice) /
        listing.originalPrice) *
        100
    );
  }

  await listing.save();

  return res
    .status(200)
    .json(new ApiResponse(200, listing, "Listing updated successfully"));
});

// ─── DELETE /api/vendor-marketplace/listings/:id ─────────────────────────────
export const deleteListing = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid listing ID");
  }

  const vendor = req.vendor || await Vendor.findOne({ userId }).lean();
  if (!vendor) throw new ApiError(403, "Vendor profile not found");

  const listing = await VendorMarketplaceListing.findOneAndUpdate(
    { _id: id, vendorId: vendor._id },
    { isActive: false },
    { new: true }
  );

  if (!listing) throw new ApiError(404, "Listing not found");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Listing removed successfully"));
});

// ─── GET /api/vendor-marketplace/my-listings ─────────────────────────────────
// Get all listings created by this vendor
export const getMyListings = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const vendor = req.vendor || await Vendor.findOne({ userId }).lean();
  if (!vendor) throw new ApiError(403, "Vendor profile not found");

  const { page = 1, limit = 20, listingType } = req.query;
  const filter = { vendorId: vendor._id };
  if (listingType && ["NEW", "SURPLUS"].includes(listingType)) {
    filter.listingType = listingType;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await VendorMarketplaceListing.countDocuments(filter);

  const listings = await VendorMarketplaceListing.find(filter)
    .populate("productId", "title price stock")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  // Enrich with live expiry discounts
  const enriched = listings.map((item) => {
    if (item.listingType === "SURPLUS" && item.expiryDate) {
      const { discountPercent, discountedPrice, daysLeft } = computeExpiryDiscount(
        item.expiryDate,
        item.originalPrice
      );
      return { ...item, discountPercent, discountedPrice, daysUntilExpiry: daysLeft };
    }
    return item;
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        listings: enriched,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
      "My listings fetched successfully"
    )
  );
});

// ─── POST /api/vendor-marketplace/listings/:id/contact ───────────────────────
// Send a contact inquiry to a listing vendor
export const contactListingVendor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid listing ID");
  }

  if (!message?.trim()) {
    throw new ApiError(400, "Message is required");
  }

  const listing = await VendorMarketplaceListing.findOneAndUpdate(
    { _id: id, isActive: true },
    { $inc: { inquiryCount: 1 } },
    { new: true }
  ).populate("vendorId", "shopName");

  if (!listing) throw new ApiError(404, "Listing not found");

  // In production this would send an email/notification to the vendor
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { inquiryCount: listing.inquiryCount },
        "Contact request sent to vendor successfully"
      )
    );
});

// ─── GET /api/vendor-marketplace/stats ───────────────────────────────────────
export const getMarketplaceStats = asyncHandler(async (req, res) => {
  const today = new Date();
  const in90Days = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

  const [totalListings, expiringCount, avgDiscountResult, surplusCount] =
    await Promise.all([
      VendorMarketplaceListing.countDocuments({ isActive: true }),
      VendorMarketplaceListing.countDocuments({
        isActive: true,
        expiryDate: { $lte: in90Days, $gte: today },
      }),
      VendorMarketplaceListing.aggregate([
        { $match: { isActive: true, discountPercent: { $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: "$discountPercent" } } },
      ]),
      VendorMarketplaceListing.countDocuments({
        isActive: true,
        listingType: "SURPLUS",
      }),
    ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalListings,
        expiringCount,
        surplusCount,
        avgDiscount: Math.round(avgDiscountResult[0]?.avg || 0),
      },
      "Marketplace stats fetched"
    )
  );
});

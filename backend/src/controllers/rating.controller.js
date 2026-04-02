import logger from "../utils/logger.js";
import { Rating } from "../models/product/Rating.model.js";
import { Order } from "../models/order/Order.model.js";
import { Vendor } from "../models/vendor/Vendor.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { computeProductRatingScore, computeVendorScore } from "./scoreComputation.controller.js";

// POST /api/ratings — submit a rating
export const submitRating = asyncHandler(async (req, res) => {
  const reviewerId = req.user._id;
  const { targetType, productId, vendorId, buyerId, orderId, stars, review } = req.body;

  if (!targetType || !stars) throw new ApiError(400, "targetType and stars are required");
  if (stars < 1 || stars > 5) throw new ApiError(400, "Stars must be 1-5");

  // Validate order ownership if orderId provided
  if (orderId) {
    const order = await Order.findOne({ _id: orderId, buyerId: reviewerId });
    if (!order) throw new ApiError(403, "You can only rate products from your own orders");
    if (!["DELIVERED", "COMPLETED"].includes(order.orderStatus)) {
      throw new ApiError(400, "You can only rate after order is delivered");
    }
  }

  // Prevent duplicate ratings
  const dupFilter = { reviewerId, targetType, orderId: orderId || undefined };
  if (productId) dupFilter.productId = productId;
  if (vendorId)  dupFilter.vendorId  = vendorId;
  const existing = await Rating.findOne(dupFilter);
  if (existing) throw new ApiError(409, "You have already rated this");

  const rating = await Rating.create({
    reviewerId,
    reviewerName: req.user.name,
    targetType,
    productId: productId || undefined,
    vendorId:  vendorId  || undefined,
    buyerId:   buyerId   || undefined,
    orderId:   orderId   || undefined,
    stars,
    review: review || "",
  });

  // Update vendor score if rating a vendor
  if (targetType === "VENDOR" && vendorId) {
    const avgResult = await Rating.aggregate([
      { $match: { vendorId: new mongoose.Types.ObjectId(vendorId), targetType: "VENDOR", isActive: true } },
      { $group: { _id: null, avgStars: { $avg: "$stars" }, count: { $sum: 1 } } },
    ]);
    if (avgResult.length > 0) {
      await Vendor.findByIdAndUpdate(vendorId, {
        $set: { "vendorScore": Math.round(avgResult[0].avgStars * 20) }, // 0-100 scale
      });
    }
  }

  // Recompute full non-AI scores asynchronously (non-blocking)
  if (targetType === "PRODUCT" && productId) {
    computeProductRatingScore(productId).catch((e) => logger.error("[Score] productRating recompute failed", e));
  }
  if (targetType === "VENDOR" && vendorId) {
    computeVendorScore(vendorId).catch((e) => logger.error("[Score] vendorScore recompute failed", e));
  }

  return res.status(201).json(new ApiResponse(201, rating, "Rating submitted successfully"));
});

// GET /api/ratings/product/:productId
export const getProductRatings = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const ratings = await Rating.find({ productId, targetType: "PRODUCT", isActive: true })
    .sort({ createdAt: -1 })
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit))
    .lean();

  const stats = await Rating.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId), targetType: "PRODUCT", isActive: true } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$stars" },
        totalRatings: { $sum: 1 },
        breakdown: {
          $push: "$stars",
        },
      },
    },
  ]);

  const s = stats[0];
  const breakdown = s ? [5,4,3,2,1].map(star => s.breakdown.filter(b => b === star).length) : [0,0,0,0,0];

  return res.status(200).json(
    new ApiResponse(200, {
      ratings,
      stats: {
        avgRating: s ? Math.round(s.avgRating * 10) / 10 : 0,
        totalRatings: s?.totalRatings || 0,
        breakdown,
      },
    }, "Product ratings fetched")
  );
});

// GET /api/ratings/vendor/:vendorId
export const getVendorRatings = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const ratings = await Rating.find({ vendorId, targetType: "VENDOR", isActive: true })
    .sort({ createdAt: -1 })
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit))
    .lean();

  const stats = await Rating.aggregate([
    { $match: { vendorId: new mongoose.Types.ObjectId(vendorId), targetType: "VENDOR", isActive: true } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$stars" },
        totalRatings: { $sum: 1 },
        fivestar: { $sum: { $cond: [{ $eq: ["$stars", 5] }, 1, 0] } },
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(200, { ratings, stats: stats[0] || { avgRating: 0, totalRatings: 0 } }, "Vendor ratings fetched")
  );
});

// GET /api/ratings/my — ratings given and received by current user
export const getMyRatings = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const [given, received] = await Promise.all([
    Rating.find({ reviewerId: userId, isActive: true }).sort({ createdAt: -1 }).lean(),
    Rating.find({ buyerId: userId, isActive: true }).sort({ createdAt: -1 }).lean(),
  ]);
  return res.status(200).json(new ApiResponse(200, { given, received }, "Ratings fetched"));
});

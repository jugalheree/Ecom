/**
 * scoreComputation.controller.js
 *
 * Computes the non-AI portion of ratings:
 *   - Product rating score: out of 2.5 (user reviews + return frequency + return reason)
 *   - Buyer score:          out of 100 (return rate, invalid returns, timing, refund logic)
 *   - Vendor score:         out of 100 (return rate, vendor-fault returns, delivery time)
 *
 * AI contributes the other 2.5 for product scores — handled by your teammate.
 * These functions are called:
 *   1. After a rating is submitted  (updateProductScore)
 *   2. After a return is processed  (updateBuyerScore, updateVendorScore)
 *   3. On demand via admin API      (recomputeAllScores)
 */

import { Rating } from "../models/product/Rating.model.js";
import { ReturnRequest } from "../models/order/ReturnRequest.model.js";
import { Order } from "../models/order/Order.model.js";
import { Product } from "../models/product/Product.model.js";
import { Vendor } from "../models/vendor/Vendor.model.js";
import { User } from "../models/auth/User.model.js";
import { ProductAIScore } from "../models/ai/ProductAIScore.model.js";
import { CategoryParameterTemplate } from "../models/ai/CategoryParameterTemplate.model.js";
import { computeProductAIScore, computeProductAIScoreDetailed, getTotalProductScore } from "../utils/aiScoring.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT SCORE  (out of 2.5, non-AI half)
//
// Components:
//   1. Average star rating          → up to 1.5 pts  (1★=0.3, 2★=0.6 ... 5★=1.5)
//   2. Return frequency ratio       → up to 0.5 pts  (lower ratio = higher score)
//   3. Return reason quality        → up to 0.5 pts  (valid returns penalise more)
// ─────────────────────────────────────────────────────────────────────────────
export const computeProductRatingScore = async (productId) => {
  const pid = new mongoose.Types.ObjectId(productId);

  // 1. Average star rating
  const ratingStats = await Rating.aggregate([
    { $match: { productId: pid, targetType: "PRODUCT", isActive: true } },
    { $group: { _id: null, avg: { $avg: "$stars" }, count: { $sum: 1 } } },
  ]);

  const avgStars = ratingStats[0]?.avg || 0;
  const ratingCount = ratingStats[0]?.count || 0;
  // Map avg stars (1–5) → 0–1.5, dampened for < 5 reviews
  const dampening = Math.min(1, ratingCount / 5);
  const starScore = (avgStars / 5) * 1.5 * dampening;

  // 2. Return frequency ratio (based on orders vs returns for this product)
  const totalOrders = await Order.countDocuments({
    "items.productId": pid,
    orderStatus: { $in: ["DELIVERED", "COMPLETED", "RETURNED", "REFUNDED"] },
  });

  const totalReturns = await ReturnRequest.countDocuments({ productId: pid });
  const returnRatio = totalOrders > 0 ? totalReturns / totalOrders : 0;

  // returnRatio 0 → 0.5 pts, 0.5+ → 0 pts (linear penalty)
  const returnFreqScore = Math.max(0, 0.5 * (1 - returnRatio * 2));

  // 3. Return reason quality — valid reasons penalise more
  const VALID_REASONS = ["Defective / Damaged product", "Wrong item received", "Item not as described"];
  const returns = await ReturnRequest.find({ productId: pid }).select("reason status").lean();
  const validReturns = returns.filter((r) => VALID_REASONS.some((v) => r.reason?.includes(v)));
  const invalidReturns = returns.filter((r) => !VALID_REASONS.some((v) => r.reason?.includes(v)));

  // Valid returns penalise product quality; invalid ones don't
  const validReturnRatio = totalOrders > 0 ? validReturns.length / totalOrders : 0;
  const reasonScore = Math.max(0, 0.5 * (1 - validReturnRatio * 3));

  const ratingScore = Math.min(2.5, Math.max(0, Math.round((starScore + returnFreqScore + reasonScore) * 100) / 100));

  // ── AI Score (description quality) ──────────────────────────────────────
  const product = await Product.findById(productId).select("title description productCategory categoryId").lean();
  let aiScoreVal = 0;
  let aiBreakdown = {};
  let aiTips = [];

  if (product) {
    let weights = null;
    if (product.categoryId) {
      const template = await CategoryParameterTemplate.findOne({ categoryId: product.categoryId }).lean();
      weights = template?.weights || null;
    }
    const detailed = computeProductAIScoreDetailed({
      title: product.title || "",
      description: product.description || "",
      productCategory: product.productCategory || "GENERAL",
    });
    aiScoreVal  = detailed.aiScore;
    aiBreakdown = detailed.breakdown;
    aiTips      = detailed.tips;
  }

  const totalScore = getTotalProductScore(aiScoreVal, ratingScore);

  // Persist AI score record (upsert)
  await ProductAIScore.findOneAndUpdate(
    { productId },
    { $set: { productId, aiScore: aiScoreVal, ratingScore, totalScore, breakdown: aiBreakdown, tips: aiTips, lastUpdated: new Date() } },
    { upsert: true, new: true }
  );

  // Update product stored scores
  await Product.findByIdAndUpdate(productId, { $set: { ratingScore, aiScore: aiScoreVal } });
  return ratingScore;
};


// ─────────────────────────────────────────────────────────────────────────────
// BUYER SCORE  (out of 100)
//
// Components:
//   1. Return rate                  → up to -30 pts penalty
//   2. Invalid return penalty       → up to -30 pts per invalid return
//   3. Late return timing (>6h)     → up to -10 pts penalty
//   4. Baseline score starts at 100
//
// Refund logic: if buyer score < 60, they receive 5% less refund
//   (enforced in the refund controller — score is stored on User)
// ─────────────────────────────────────────────────────────────────────────────
export const computeBuyerScore = async (buyerId) => {
  const uid = new mongoose.Types.ObjectId(buyerId);

  const totalOrders = await Order.countDocuments({
    buyerId: uid,
    orderStatus: { $in: ["DELIVERED", "COMPLETED", "RETURNED", "REFUNDED"] },
  });

  if (totalOrders === 0) return 100;

  const returns = await ReturnRequest.find({ buyerId: uid }).lean();
  const totalReturns = returns.length;

  // 1. Return rate penalty
  const returnRate = totalReturns / totalOrders;
  const returnRatePenalty = Math.min(30, returnRate * 60);   // 50% return rate = -30

  // 2. Invalid return penalty (invalid = not defective/wrong/misdescribed)
  const VALID_REASONS = ["Defective / Damaged product", "Wrong item received", "Item not as described"];
  const invalidReturns = returns.filter((r) => !VALID_REASONS.some((v) => r.reason?.includes(v)));
  const invalidPenalty = Math.min(30, invalidReturns.length * 10);  // each invalid = -10 (max -30)

  // 3. Late return timing penalty (return requested > 6 hours after delivery)
  const lateReturns = returns.filter((r) => {
    if (!r.requestedAt) return false;
    const SIX_HOURS = 6 * 60 * 60 * 1000;
    return (new Date(r.requestedAt) - new Date(r.createdAt)) > SIX_HOURS;
  });
  const latePenalty = Math.min(10, lateReturns.length * 2);

  const score = Math.round(Math.max(0, 100 - returnRatePenalty - invalidPenalty - latePenalty));

  // Store score on User model (using a virtual-safe field approach)
  await User.findByIdAndUpdate(buyerId, { $set: { buyerScore: score } });
  return score;
};


// ─────────────────────────────────────────────────────────────────────────────
// VENDOR SCORE  (out of 100)
//
// Components:
//   1. Return rate                        → up to -30 pts
//   2. Vendor-fault returns               → up to -30 pts
//   3. Late delivery penalty              → up to -20 pts
// ─────────────────────────────────────────────────────────────────────────────
export const computeVendorScore = async (vendorId) => {
  const vid = new mongoose.Types.ObjectId(vendorId);

  const totalOrders = await Order.countDocuments({
    "items.vendorId": vid,
    orderStatus: { $in: ["DELIVERED", "COMPLETED", "RETURNED", "REFUNDED"] },
  });

  if (totalOrders === 0) return 100;

  const returns = await ReturnRequest.find({ vendorId: vid }).lean();

  // 1. Return rate penalty
  const returnRate = returns.length / totalOrders;
  const returnRatePenalty = Math.min(30, returnRate * 60);

  // 2. Vendor-fault return penalty (defective, wrong item, misdescribed = vendor fault)
  const VENDOR_FAULT_REASONS = ["Defective / Damaged product", "Wrong item received", "Item not as described"];
  const vendorFaultReturns = returns.filter((r) =>
    VENDOR_FAULT_REASONS.some((v) => r.reason?.includes(v))
  );
  const faultPenalty = Math.min(30, (vendorFaultReturns.length / Math.max(totalOrders, 1)) * 90);

  // 3. Late delivery — compare item.shippedAt vs order.createdAt against product.maxDeliveryDays
  const deliveredOrders = await Order.find({
    "items.vendorId": vid,
    orderStatus: { $in: ["DELIVERED", "COMPLETED"] },
  }).select("items createdAt").lean();

  let lateCount = 0;
  deliveredOrders.forEach((order) => {
    order.items
      .filter((i) => i.vendorId?.toString() === vendorId.toString() && i.deliveredAt)
      .forEach((item) => {
        const daysTaken = (new Date(item.deliveredAt) - new Date(order.createdAt)) / (1000 * 60 * 60 * 24);
        if (daysTaken > 5) lateCount++;  // 5 days default threshold
      });
  });

  const lateRatio = totalOrders > 0 ? lateCount / totalOrders : 0;
  const latePenalty = Math.min(20, lateRatio * 40);

  const score = Math.round(Math.max(0, 100 - returnRatePenalty - faultPenalty - latePenalty));

  await Vendor.findByIdAndUpdate(vendorId, { $set: { vendorScore: score } });
  return score;
};


// ─────────────────────────────────────────────────────────────────────────────
// HTTP handlers — called from routes
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/scores/product/:productId  (internal / admin trigger)
export const recomputeProductScore = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const score = await computeProductRatingScore(productId);
  return res.status(200).json(new ApiResponse(200, { score }, "Product score updated"));
});

// POST /api/scores/buyer/:buyerId
export const recomputeBuyerScore = asyncHandler(async (req, res) => {
  const { buyerId } = req.params;
  const score = await computeBuyerScore(buyerId);
  return res.status(200).json(new ApiResponse(200, { score }, "Buyer score updated"));
});

// POST /api/scores/vendor/:vendorId
export const recomputeVendorScore = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const score = await computeVendorScore(vendorId);
  return res.status(200).json(new ApiResponse(200, { score }, "Vendor score updated"));
});
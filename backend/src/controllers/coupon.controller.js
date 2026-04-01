import mongoose from "mongoose";
import { Coupon } from "../models/finance/Coupon.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ── Admin: Create coupon ──────────────────────────────────────────────────
export const createCoupon = asyncHandler(async (req, res) => {
  const { code, description, discountType, discountValue, minOrderValue, maxDiscount, usageLimit, expiresAt } = req.body;
  if (!code || !discountType || !discountValue) throw new ApiError(400, "code, discountType and discountValue are required");
  if (!["PERCENT", "FLAT"].includes(discountType)) throw new ApiError(400, "discountType must be PERCENT or FLAT");
  if (discountType === "PERCENT" && discountValue > 100) throw new ApiError(400, "Percent discount cannot exceed 100");

  const sanitizedCode = code.toUpperCase().trim().replace(/[^A-Z0-9_-]/g, "");
  if (!sanitizedCode) throw new ApiError(400, "Coupon code contains invalid characters");

  const coupon = await Coupon.create({
    code: sanitizedCode,
    description,
    discountType,
    discountValue: Number(discountValue),
    minOrderValue:  Number(minOrderValue  || 0),
    maxDiscount:    maxDiscount  ? Number(maxDiscount)  : null,
    usageLimit:     usageLimit   ? Number(usageLimit)   : null,
    expiresAt:      expiresAt    ? new Date(expiresAt)  : null,
  });

  return res.status(201).json(new ApiResponse(201, coupon, "Coupon created"));
});

// ── Admin: List all coupons ───────────────────────────────────────────────
export const listCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
  return res.status(200).json(new ApiResponse(200, coupons, "Coupons fetched"));
});

// ── Admin: Toggle active ──────────────────────────────────────────────────
export const toggleCoupon = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw new ApiError(400, "Invalid coupon ID");
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw new ApiError(404, "Coupon not found");
  coupon.isActive = !coupon.isActive;
  await coupon.save();
  return res.status(200).json(new ApiResponse(200, coupon, `Coupon ${coupon.isActive ? "activated" : "deactivated"}`));
});

// ── Admin: Delete coupon ──────────────────────────────────────────────────
export const deleteCoupon = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw new ApiError(400, "Invalid coupon ID");
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) throw new ApiError(404, "Coupon not found");
  return res.status(200).json(new ApiResponse(200, null, "Coupon deleted"));
});

// ── Public: Validate coupon ───────────────────────────────────────────────
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderTotal } = req.body;
  if (!code) throw new ApiError(400, "Coupon code required");

  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim(), isActive: true });
  if (!coupon) throw new ApiError(404, "Invalid or expired coupon code");

  if (coupon.expiresAt && new Date() > coupon.expiresAt) throw new ApiError(400, "This coupon has expired");
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) throw new ApiError(400, "This coupon has reached its usage limit");
  if (orderTotal < coupon.minOrderValue) throw new ApiError(400, `Minimum order of ₹${coupon.minOrderValue} required`);

  let discountAmount = 0;
  if (coupon.discountType === "PERCENT") {
    discountAmount = Math.round((orderTotal * coupon.discountValue) / 100);
    if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, coupon.maxDiscount);
  } else {
    discountAmount = Math.min(coupon.discountValue, orderTotal);
  }

  return res.status(200).json(new ApiResponse(200, {
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount,
    description: coupon.description,
  }, "Coupon applied!"));
});

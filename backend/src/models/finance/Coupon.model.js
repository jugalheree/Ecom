import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  description: { type: String, default: "" },
  discountType: {
    type: String,
    enum: ["PERCENT", "FLAT"],
    required: true,
  },
  discountValue: { type: Number, required: true, min: 0 },
  minOrderValue:  { type: Number, default: 0 },
  maxDiscount:    { type: Number, default: null }, // cap for PERCENT type
  usageLimit:     { type: Number, default: null }, // null = unlimited
  usedCount:      { type: Number, default: 0 },
  expiresAt:      { type: Date, default: null },
  isActive:       { type: Boolean, default: true },
}, { timestamps: true });

export const Coupon = mongoose.model("Coupon", couponSchema);

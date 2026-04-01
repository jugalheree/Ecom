import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    // Who left the rating
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewerName: { type: String },

    // What is being rated
    targetType: {
      type: String,
      enum: ["PRODUCT", "VENDOR", "BUYER"],
      required: true,
    },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    vendorId:  { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
    buyerId:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Linked order (for validation)
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },

    stars:  { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ratingSchema.index({ productId: 1, targetType: 1 });
ratingSchema.index({ vendorId: 1,  targetType: 1 });
ratingSchema.index({ reviewerId: 1 });

export const Rating = mongoose.model("Rating", ratingSchema);

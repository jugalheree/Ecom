import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      lowercase: true,
    },

    description: {
      type: String,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
    },

    saleType: {
      type: String,
      enum: ["B2C", "B2B", "BOTH"],
      default: "B2C",
    },

    minOrderQty: {
      type: Number,
      default: 1,
    },

    maxOrderQty: {
      type: Number,
    },

    gstRequired: {
      type: Boolean,
      default: false,
    },

    bulkDiscountEnabled: {
      type: Boolean,
      default: false,
    },

    minDeliveryDays: {
      type: Number,
      required: true,
    },

    maxDeliveryDays: {
      type: Number,
      required: true,
    },

    aiScore: {
      type: Number,
      default: 0,
    },

    isApproved: {
      type: Boolean,
      default: false,
    },

    approvalStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    adminRemark: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

productSchema.index({ title: "text", description: "text" });

export const Product = mongoose.model("Product", productSchema);
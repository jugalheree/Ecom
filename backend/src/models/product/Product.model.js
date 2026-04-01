import mongoose from "mongoose";

// Clothing standard sizes
const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "FREE SIZE",
  "28", "30", "32", "34", "36", "38", "40", "42", "44", "46"];

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

    // ── Product Standards & Dates ─────────────────────────────────────────
    manufacturingDate: {
      type: Date,
      default: null,
    },

    expiryDate: {
      type: Date,
      default: null,
    },

    hasExpiry: {
      type: Boolean,
      default: false,
    },

    // For clothing products — standard sizes available
    clothingSizes: {
      type: [String],
      enum: CLOTHING_SIZES,
      default: [],
    },

    // Category-level standard fields (JSON object of key standards)
    productStandards: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // e.g. "FOOD", "CLOTHING", "ELECTRONICS", "PHARMA", "GENERAL"
    productCategory: {
      type: String,
      default: "GENERAL",
    },

    // ─────────────────────────────────────────────────────────────────────

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
productSchema.index({ categoryId: 1 })
productSchema.index({ vendorId: 1 })
productSchema.index({ price: 1 })
productSchema.index({ createdAt: -1 })
productSchema.index({ approvalStatus: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ title: 1 });
productSchema.index({ expiryDate: 1 });

export const Product = mongoose.model("Product", productSchema);
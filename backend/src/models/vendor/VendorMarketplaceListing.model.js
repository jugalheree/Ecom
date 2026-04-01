import mongoose from "mongoose";

const vendorMarketplaceListingSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // Category of listing
    listingType: {
      type: String,
      enum: ["NEW", "SURPLUS"], // NEW = new products with/without discount, SURPLUS = near-expiry/surplus stock
      required: true,
      default: "NEW",
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    originalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    discountedPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    // Discount percentage — auto-calculated or manual
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    stock: {
      type: Number,
      required: true,
      min: 1,
    },

    unit: {
      type: String,
      default: "piece",
    },

    // For SURPLUS listings
    expiryDate: {
      type: Date,
      default: null,
    },

    manufacturingDate: {
      type: Date,
      default: null,
    },

    // Reason for selling (required for SURPLUS)
    reason: {
      type: String,
      trim: true,
    },

    // Condition of items
    condition: {
      type: String,
      enum: ["NEW", "EXCELLENT", "GOOD"],
      default: "NEW",
    },

    // Contact info for direct negotiation
    contactInfo: {
      type: String,
      trim: true,
    },

    // Category for filtering
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Track contacts/inquiries count
    inquiryCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Auto-compute discount percent before save
vendorMarketplaceListingSchema.pre("save", function () {
  if (this.originalPrice > 0 && this.discountedPrice < this.originalPrice) {
    this.discountPercent = Math.round(
      ((this.originalPrice - this.discountedPrice) / this.originalPrice) * 100
    );
  } else {
    this.discountPercent = 0;
  }
});

vendorMarketplaceListingSchema.index({ vendorId: 1 });
vendorMarketplaceListingSchema.index({ listingType: 1 });
vendorMarketplaceListingSchema.index({ categoryId: 1 });
vendorMarketplaceListingSchema.index({ expiryDate: 1 });
vendorMarketplaceListingSchema.index({ isActive: 1 });
vendorMarketplaceListingSchema.index({ createdAt: -1 });

export const VendorMarketplaceListing = mongoose.model(
  "VendorMarketplaceListing",
  vendorMarketplaceListingSchema
);

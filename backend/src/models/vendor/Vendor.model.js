import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // SOLO or ORGANIZATION
    vendorType: {
      type: String,
      enum: ["SOLO", "ORGANIZATION"],
      default: "SOLO",
    },

    shopName: {
      type: String,
      required: true,
    },

    businessType: {
      type: String,
      required: true,
    },

    panNumber: {
      type: String,
      required: true,
    },

    // GST is optional for both vendor types
    gstNumber: {
      type: String,
      default: null,
    },

    // Organization-only fields
    orgOwnerName: {
      type: String,
      default: null,
    },

    orgOwnerPhone: {
      type: String,
      default: null,
    },

    businessAddresses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
      },
    ],

    // 📍 Shop location for geo-based filtering
    shopLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },

    // Delivery radius in km
    deliveryRadiusKm: {
      type: Number,
      default: 10,
    },

    freeDeliveryDistanceKm: {
      type: Number,
      default: 0,
    },

    deliveryChargePerKm: {
      type: Number,
      default: 0,
    },

    totalOrders: {
      type: Number,
      default: 0,
    },

    // Vendor Rating Parameters
    deliverySpeedScore: {
      type: Number,
      default: 5, // out of 10
    },

    orderSuccessRate: {
      type: Number,
      default: 100, // percentage
    },

    cancelRate: {
      type: Number,
      default: 0, // percentage
    },

    returnRate: {
      type: Number,
      default: 0, // percentage
    },

    // Computed vendor score
    vendorScore: {
      type: Number,
      default: 100,
    },

    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Auto-compute vendorScore before save
vendorSchema.pre("save", function () {
  // Score = DeliverySpeed*5 + OrderSuccess - ReturnRate*2 - CancelRate*3
  const score =
    this.deliverySpeedScore * 5 +
    this.orderSuccessRate -
    this.returnRate * 2 -
    this.cancelRate * 3;
  this.vendorScore = Math.max(0, Math.min(100, score));
});

export const Vendor = mongoose.model("Vendor", vendorSchema);

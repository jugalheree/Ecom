import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

    gstNumber: {
      type: String,
      required: true,
    },

    businessAddresses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
      },
    ],

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

    cancelRate: {
      type: Number,
      default: 0,
    },

    returnRate: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Vendor = mongoose.model("Vendor", vendorSchema);

import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    addressType: {
      type: String,
      enum: ["HOME", "SHOP", "WAREHOUSE"],
      default: "SHOP",
    },

    country: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    area: {
      type: String,
      required: true,
    },

    pincode: {
      type: String,
      required: true,
    },

    buildingNameOrNumber: {
      type: String,
      required: true,
    },

    landmark: String,

    location: {
      lat: Number,
      lng: Number,
    },
  },
  { timestamps: true }
);

export const Address = mongoose.model("Address", addressSchema);

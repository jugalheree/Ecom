import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    fullAddress: { type: String, required: true },
    city: String,
    state: String,
    country: String,
    pincode: String,

    location: {
      lat: Number,
      lng: Number,
    },

    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Address = mongoose.model("Address", addressSchema);
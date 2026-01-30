import mongoose from "mongoose";

const vendorAIScoreSchema = new mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },

    trustScore: { type: Number, default: 100 },

    returnRate: { type: Number, default: 0 },
    disputeLossRate: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const VendorAIScore = mongoose.model("VendorAIScore", vendorAIScoreSchema);

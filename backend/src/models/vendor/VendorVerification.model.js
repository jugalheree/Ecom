import mongoose from "mongoose";

const vendorVerificationSchema = new mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },

    documents: [String],
    status: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED"],
      default: "PENDING",
    },

    adminRemark: String,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const VendorVerification = mongoose.model(
  "VendorVerification",
  vendorVerificationSchema
);

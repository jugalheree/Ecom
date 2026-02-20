import mongoose from "mongoose";

const vendorBankSchema = new mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },

    bankName: String,
    accountHolderName: String,
    accountNumber: String,
    ifscCode: String,

    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const VendorBankAccount = mongoose.model(
  "VendorBankAccount",
  vendorBankSchema
);
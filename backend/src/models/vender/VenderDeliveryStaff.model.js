import mongoose from "mongoose";

const vendorDeliveryStaffSchema = new mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },

    name: String,
    phone: String,
    isActive: { type: Boolean, default: true },

    totalDeliveries: { type: Number, default: 0 },
    delayedDeliveries: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const VendorDeliveryStaff = mongoose.model(
  "VendorDeliveryStaff",
  vendorDeliveryStaffSchema
);

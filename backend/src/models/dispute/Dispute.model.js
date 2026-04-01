import mongoose from "mongoose";

const disputeSchema = new mongoose.Schema(
  {
    orderId:  { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    buyerId:  { type: mongoose.Schema.Types.ObjectId, ref: "User",  required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
    reason: { type: String, required: true },
    description: { type: String },
    amount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["OPEN", "UNDER_REVIEW", "RESOLVED", "REJECTED", "REFUNDED"],
      default: "OPEN",
    },
    resolution: { type: String },
    resolvedAt: { type: Date },
    adminNote: { type: String },
  },
  { timestamps: true }
);

disputeSchema.index({ buyerId: 1, createdAt: -1 });
disputeSchema.index({ status: 1 });

export const Dispute = mongoose.model("Dispute", disputeSchema);

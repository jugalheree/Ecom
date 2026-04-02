import mongoose from "mongoose";

const walletTransactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["CREDIT", "DEBIT", "LOCK", "UNLOCK", "REFUND", "WITHDRAWAL"],
      required: true,
    },
    amount: { type: Number, required: true },
    description: { type: String },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    status: { type: String, enum: ["PENDING", "COMPLETED", "FAILED"], default: "COMPLETED" },
  },
  { timestamps: true }
);

walletTransactionSchema.index({ userId: 1, createdAt: -1 });

export const WalletTransaction = mongoose.model("WalletTransaction", walletTransactionSchema);

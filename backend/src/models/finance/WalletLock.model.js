import mongoose from "mongoose";

const walletLockSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["LOCKED", "RELEASED", "FORFEITED"], default: "LOCKED" },
  },
  { timestamps: true }
);

export const WalletLock = mongoose.model("WalletLock", walletLockSchema);

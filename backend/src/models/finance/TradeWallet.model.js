import mongoose from "mongoose";

const tradeWalletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: { type: Number, default: 0 },   // total balance
    locked: { type: Number, default: 0 },    // locked in escrow
    withdrawn: { type: Number, default: 0 }, // cumulative withdrawn
  },
  { timestamps: true }
);

tradeWalletSchema.virtual("available").get(function () {
  return this.balance - this.locked;
});

export const TradeWallet = mongoose.model("TradeWallet", tradeWalletSchema);

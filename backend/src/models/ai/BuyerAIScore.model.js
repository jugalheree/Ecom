import mongoose from "mongoose";

const buyerAIScoreSchema = new mongoose.Schema(
  {
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    score: { type: Number, default: 100 },

    returnRate: { type: Number, default: 0 },
    cancellationRate: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const BuyerAIScore = mongoose.model("BuyerAIScore", buyerAIScoreSchema);

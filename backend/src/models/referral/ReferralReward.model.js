import mongoose from "mongoose";

const referralRewardSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    referralId: { type: mongoose.Schema.Types.ObjectId, ref: "Referral", required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["REFERRER_BONUS", "REFEREE_BONUS"], required: true },
    status: { type: String, enum: ["PENDING", "CREDITED", "EXPIRED"], default: "PENDING" },
    creditedAt: Date,
  },
  { timestamps: true }
);

export const ReferralReward = mongoose.model("ReferralReward", referralRewardSchema);

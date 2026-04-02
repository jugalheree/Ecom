import mongoose from "mongoose";

const referralSchema = new mongoose.Schema(
  {
    referrerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    referredUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    referralCode: { type: String, required: true, uppercase: true, trim: true },
    status: { type: String, enum: ["PENDING", "REWARDED", "EXPIRED"], default: "PENDING" },
    rewardedAt: Date,
  },
  { timestamps: true }
);

referralSchema.index({ referrerId: 1 });
referralSchema.index({ referralCode: 1 });

export const Referral = mongoose.model("Referral", referralSchema);

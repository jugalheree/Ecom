import crypto from "crypto";
import { User } from "../models/auth/User.model.js";
import { Referral } from "../models/referral/Referral.model.js";
import { ReferralReward } from "../models/referral/ReferralReward.model.js";
import { TradeWallet } from "../models/finance/TradeWallet.model.js";
import { WalletTransaction } from "../models/finance/WalletTransaction.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const REFERRER_BONUS = Number(process.env.REFERRAL_BONUS_REFERRER) || 100; // ₹100 to referrer
const REFEREE_BONUS  = Number(process.env.REFERRAL_BONUS_REFEREE)  || 50;  // ₹50 to new user

// ── Generate a deterministic referral code for a user ────────────────────
const makeReferralCode = (userId) =>
  "TS" + crypto.createHash("sha256").update(userId.toString()).digest("hex").slice(0, 8).toUpperCase();

// GET /api/referral/my-code — get or display my referral code
export const getMyReferralCode = asyncHandler(async (req, res) => {
  const code = makeReferralCode(req.user._id);
  const stats = await Referral.countDocuments({ referrerId: req.user._id, status: "REWARDED" });
  const pending = await Referral.countDocuments({ referrerId: req.user._id, status: "PENDING" });
  const totalEarned = await ReferralReward.aggregate([
    { $match: { userId: req.user._id, type: "REFERRER_BONUS", status: "CREDITED" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  return res.status(200).json(new ApiResponse(200, {
    referralCode: code,
    referrerBonus: REFERRER_BONUS,
    refereeBonus: REFEREE_BONUS,
    stats: {
      totalRewarded: stats,
      pendingReferrals: pending,
      totalEarned: totalEarned[0]?.total || 0,
    },
  }, "Referral code fetched"));
});

// POST /api/referral/apply — new user applies a referral code after registering
export const applyReferralCode = asyncHandler(async (req, res) => {
  const { code } = req.body;
  if (!code) throw new ApiError(400, "Referral code is required");

  const referredUserId = req.user._id;

  // Prevent re-use
  const alreadyReferred = await Referral.findOne({ referredUserId });
  if (alreadyReferred) throw new ApiError(409, "You have already used a referral code");

  // Find referrer by code
  const allUsers = await User.find({}, "_id").lean();
  const referrer = allUsers.find(
    (u) => makeReferralCode(u._id) === code.toUpperCase().trim()
  );

  if (!referrer) throw new ApiError(404, "Invalid referral code");
  if (referrer._id.toString() === referredUserId.toString()) {
    throw new ApiError(400, "You cannot use your own referral code");
  }

  // Create referral record
  const referral = await Referral.create({
    referrerId: referrer._id,
    referredUserId,
    referralCode: code.toUpperCase().trim(),
    status: "REWARDED",
    rewardedAt: new Date(),
  });

  // Credit referee wallet
  let refereeWallet = await TradeWallet.findOne({ userId: referredUserId });
  if (!refereeWallet) refereeWallet = await TradeWallet.create({ userId: referredUserId });
  refereeWallet.balance += REFEREE_BONUS;
  await refereeWallet.save();

  await WalletTransaction.create({
    userId: referredUserId,
    type: "CREDIT",
    amount: REFEREE_BONUS,
    description: "Welcome bonus from referral",
    status: "COMPLETED",
  });

  await ReferralReward.create({
    userId: referredUserId,
    referralId: referral._id,
    amount: REFEREE_BONUS,
    type: "REFEREE_BONUS",
    status: "CREDITED",
    creditedAt: new Date(),
  });

  // Credit referrer wallet
  let referrerWallet = await TradeWallet.findOne({ userId: referrer._id });
  if (!referrerWallet) referrerWallet = await TradeWallet.create({ userId: referrer._id });
  referrerWallet.balance += REFERRER_BONUS;
  await referrerWallet.save();

  await WalletTransaction.create({
    userId: referrer._id,
    type: "CREDIT",
    amount: REFERRER_BONUS,
    description: `Referral bonus — someone joined with your code`,
    status: "COMPLETED",
  });

  await ReferralReward.create({
    userId: referrer._id,
    referralId: referral._id,
    amount: REFERRER_BONUS,
    type: "REFERRER_BONUS",
    status: "CREDITED",
    creditedAt: new Date(),
  });

  return res.status(200).json(new ApiResponse(200, {
    refereeBonus: REFEREE_BONUS,
    message: `₹${REFEREE_BONUS} added to your wallet as a welcome bonus!`,
  }, "Referral applied successfully"));
});

// GET /api/referral/history — my referral history
export const getReferralHistory = asyncHandler(async (req, res) => {
  const referrals = await Referral.find({ referrerId: req.user._id })
    .populate("referredUserId", "name createdAt")
    .sort({ createdAt: -1 })
    .lean();

  return res.status(200).json(new ApiResponse(200, referrals, "Referral history fetched"));
});

import mongoose from "mongoose";
import { TradeWallet } from "../models/finance/TradeWallet.model.js";
import { WalletTransaction } from "../models/finance/WalletTransaction.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const MAX_SINGLE_TRANSACTION = 500000; // ₹5 lakh cap per transaction

// Get or create wallet for current user
const getOrCreateWallet = async (userId) => {
  let wallet = await TradeWallet.findOne({ userId });
  if (!wallet) wallet = await TradeWallet.create({ userId });
  return wallet;
};

// GET /api/wallet  — get my wallet
export const getMyWallet = asyncHandler(async (req, res) => {
  const wallet = await getOrCreateWallet(req.user._id);
  const transactions = await WalletTransaction.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  return res.status(200).json(
    new ApiResponse(200, {
      balance: wallet.balance,
      locked: wallet.locked,
      available: wallet.balance - wallet.locked,
      withdrawn: wallet.withdrawn,
      transactions,
    }, "Wallet fetched successfully")
  );
});

// POST /api/wallet/add  — add money
export const addMoney = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  const parsed = Number(amount);
  if (!parsed || parsed <= 0 || !Number.isFinite(parsed)) throw new ApiError(400, "Valid amount required");
  if (parsed > MAX_SINGLE_TRANSACTION) throw new ApiError(400, `Maximum single deposit is ₹${MAX_SINGLE_TRANSACTION.toLocaleString()}`);
  if (!Number.isInteger(parsed * 100)) throw new ApiError(400, "Amount must have at most 2 decimal places");

  const wallet = await getOrCreateWallet(req.user._id);
  wallet.balance = Math.round((wallet.balance + parsed) * 100) / 100;
  await wallet.save();

  await WalletTransaction.create({
    userId: req.user._id,
    type: "CREDIT",
    amount: Number(amount),
    description: "Money added to wallet",
    status: "COMPLETED",
  });

  return res.status(200).json(new ApiResponse(200, { balance: wallet.balance }, "Money added successfully"));
});

// POST /api/wallet/withdraw
export const withdrawMoney = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  const parsed = Number(amount);
  if (!parsed || parsed <= 0 || !Number.isFinite(parsed)) throw new ApiError(400, "Valid amount required");
  if (parsed > MAX_SINGLE_TRANSACTION) throw new ApiError(400, `Maximum single withdrawal is ₹${MAX_SINGLE_TRANSACTION.toLocaleString()}`);

  const wallet = await getOrCreateWallet(req.user._id);
  const available = Math.round((wallet.balance - wallet.locked) * 100) / 100;
  if (parsed > available) throw new ApiError(400, `Insufficient balance. Available: ₹${available}`);

  wallet.balance = Math.round((wallet.balance - parsed) * 100) / 100;
  wallet.withdrawn = Math.round((wallet.withdrawn + parsed) * 100) / 100;
  await wallet.save();

  await WalletTransaction.create({
    userId: req.user._id,
    type: "WITHDRAWAL",
    amount: Number(amount),
    description: "Withdrawal to bank account",
    status: "COMPLETED",
  });

  return res.status(200).json(new ApiResponse(200, { balance: wallet.balance, available: wallet.balance - wallet.locked }, "Withdrawal successful"));
});

// GET /api/wallet/transactions
export const getTransactions = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    WalletTransaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    WalletTransaction.countDocuments({ userId: req.user._id }),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      transactions,
      pagination: { total, currentPage: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) },
    }, "Transactions fetched")
  );
});

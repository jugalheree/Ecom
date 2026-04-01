import { Dispute } from "../models/dispute/Dispute.model.js";
import { Order } from "../models/order/Order.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { TradeWallet } from "../models/finance/TradeWallet.model.js";
import { WalletTransaction } from "../models/finance/WalletTransaction.model.js";

// POST /api/disputes — buyer raises dispute
export const raiseDispute = asyncHandler(async (req, res) => {
  const buyerId = req.user._id;
  const { orderId, reason, description, amount } = req.body;
  if (!orderId || !reason) throw new ApiError(400, "Order ID and reason required");

  const order = await Order.findOne({ _id: orderId, buyerId });
  if (!order) throw new ApiError(404, "Order not found or not yours");

  const existing = await Dispute.findOne({ orderId, buyerId, status: { $nin: ["REJECTED", "RESOLVED", "REFUNDED"] } });
  if (existing) throw new ApiError(409, "An open dispute already exists for this order");

  const dispute = await Dispute.create({
    orderId,
    buyerId,
    vendorId: order.items?.[0]?.vendorId,
    reason,
    description: description || "",
    amount: amount || order.totalAmount,
  });

  return res.status(201).json(new ApiResponse(201, dispute, "Dispute raised successfully"));
});

// GET /api/disputes/my — buyer's disputes
export const getMyDisputes = asyncHandler(async (req, res) => {
  const disputes = await Dispute.find({ buyerId: req.user._id })
    .sort({ createdAt: -1 })
    .populate("orderId", "orderNumber totalAmount")
    .lean();
  return res.status(200).json(new ApiResponse(200, disputes, "Disputes fetched"));
});

// GET /api/admin/disputes — all disputes (admin)
export const getAllDisputes = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const [disputes, total] = await Promise.all([
    Dispute.find(filter)
      .sort({ createdAt: -1 })
      .skip((parseInt(page)-1)*parseInt(limit))
      .limit(parseInt(limit))
      .populate("buyerId", "name email phone")
      .populate("orderId", "orderNumber totalAmount")
      .lean(),
    Dispute.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      disputes,
      pagination: { total, currentPage: parseInt(page), totalPages: Math.ceil(total/parseInt(limit)) },
    }, "Disputes fetched")
  );
});

// PATCH /api/admin/disputes/:id/resolve — admin resolves
export const resolveDispute = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, resolution, adminNote, refundAmount } = req.body;
  const ALLOWED = ["RESOLVED", "REJECTED", "REFUNDED", "UNDER_REVIEW"];
  if (!ALLOWED.includes(status)) throw new ApiError(400, "Invalid status");
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid ID");

  const dispute = await Dispute.findById(id);
  if (!dispute) throw new ApiError(404, "Dispute not found");
  if (dispute.status === "REFUNDED") throw new ApiError(400, "Dispute already refunded");

  // ── Wallet refund when admin marks as REFUNDED ────────────────────────
  if (status === "REFUNDED") {
    const amountToRefund = Number(refundAmount) || dispute.amount || 0;
    if (amountToRefund <= 0) throw new ApiError(400, "refundAmount must be positive");

    // Credit buyer wallet
    let wallet = await TradeWallet.findOne({ userId: dispute.buyerId });
    if (!wallet) wallet = await TradeWallet.create({ userId: dispute.buyerId });
    wallet.balance += amountToRefund;
    await wallet.save();

    await WalletTransaction.create({
      userId: dispute.buyerId,
      type: "REFUND",
      amount: amountToRefund,
      description: `Dispute refund for order #${dispute.orderId}`,
      status: "COMPLETED",
      orderId: dispute.orderId,
    });

    // Mark linked order as refunded
    await Order.findByIdAndUpdate(dispute.orderId, {
      paymentStatus: "REFUNDED",
      orderStatus: "REFUNDED",
    });
  }

  dispute.status = status;
  dispute.resolution = resolution || "";
  dispute.adminNote = adminNote || "";
  if (["RESOLVED", "REJECTED", "REFUNDED"].includes(status)) dispute.resolvedAt = new Date();
  await dispute.save();

  return res.status(200).json(new ApiResponse(200, dispute, "Dispute updated"));
});

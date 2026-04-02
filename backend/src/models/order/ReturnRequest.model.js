import mongoose from "mongoose";

const returnRequestSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },

    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true
    },

    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    quantity: {
      type: Number,
      required: true
    },

    reason: {
      type: String,
      required: true
    },

    description: {
      type: String
    },

    images: [
      {
        type: String
      }
    ],

    status: {
      type: String,
      enum: [
        "REQUESTED",
        "APPROVED",
        "REJECTED",
        "PICKED_UP",
        "RECEIVED",
        "REFUNDED"
      ],
      default: "REQUESTED"
    },

    adminRemark: {
      type: String
    },

    vendorRemark: {
      type: String
    },

    requestedAt: {
      type: Date,
      default: Date.now
    },

    approvedAt: Date,

    rejectedAt: Date,

    pickedUpAt: Date,

    receivedAt: Date,

    refundMethod: String,

    refundAmount: Number,

    refundedAt: Date
  },
  { timestamps: true }
);

// Only prevent duplicate ACTIVE return requests (not rejected ones)
// A buyer can re-request a return if their previous one was REJECTED
returnRequestSchema.index(
  { orderId: 1, productId: 1, buyerId: 1, status: 1 }
);

export const ReturnRequest = mongoose.model(
  "ReturnRequest",
  returnRequestSchema
);
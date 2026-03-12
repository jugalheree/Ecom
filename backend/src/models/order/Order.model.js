import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
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

    quantity: {
      type: Number,
      required: true
    },

    priceAtPurchase: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: ["PENDING", "SHIPPED", "DELIVERED","CANCELLED", "RETURN_REQUESTED", "RETURNED"],
      default: "PENDING"
    },

    shippedAt: Date,

    deliveredAt: Date
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    items: [orderItemSchema],

    totalAmount: Number,

    orderStatus: {
      type: String,
      enum: [
        "PENDING_PAYMENT",
        "CONFIRMED",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "COMPLETED",
        "CANCELLED",
        "RETURN_REQUESTED",
        "RETURNED",
        "REFUNDED",
      ],
      default: "PENDING_PAYMENT",
    },

    paymentMethod: {
      type: String,
      enum: ["TRADE_WALLET", "DUMMY", "UPI", "CARD"],
      default: "DUMMY",
    },

    orderNumber: {
      type: String,
      unique: true,
      // index: true
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
    },

    cancelledAt: Date,

    returnWindowEndsAt: Date,
  },

  { timestamps: true }
);

orderSchema.index({ buyerId: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ "items.vendorId": 1 });
orderSchema.index({ createdAt: -1 });

orderSchema.pre("save", async function() {
  if (!this.orderNumber) {
    this.orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random()*10000)}`;
  }
});

export const Order = mongoose.model("Order", orderSchema);
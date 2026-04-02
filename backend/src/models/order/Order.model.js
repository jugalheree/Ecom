import mongoose from "mongoose";

const deliveryTrackingSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        "ORDER_PLACED",
        "PAYMENT_CONFIRMED",
        "PROCESSING",
        "PACKED",
        "PICKED_UP",
        "IN_TRANSIT",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "FAILED_DELIVERY",
        "RETURN_INITIATED",
        "RETURN_PICKED_UP",
        "RETURNED",
      ],
      required: true,
    },
    message: String,
    location: String,
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

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
      enum: ["PENDING", "PACKED", "PICKED_UP", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURN_REQUESTED", "RETURNED", "REFUNDED"],
      default: "PENDING"
    },

    shippedAt: Date,
    packedAt: Date,
    pickedUpAt: Date,
    outForDeliveryAt: Date,
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

    deliveryAddress: {
      name: String,
      phone: String,
      street: String,
      area: String,
      city: String,
      state: String,
      pincode: String,
      lat: Number,
      lng: Number,
    },

    // Amazon/Flipkart-style delivery tracking
    deliveryTracking: [deliveryTrackingSchema],

    estimatedDeliveryDate: Date,

    orderStatus: {
      type: String,
      enum: [
        "PENDING_PAYMENT",
        "CONFIRMED",
        "PROCESSING",
        "PACKED",
        "PICKED_UP",
        "SHIPPED",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "COMPLETED",
        "CANCELLED",
        "RETURN_REQUESTED",
        "RETURNED",
        "REFUNDED",
      ],
      default: "PENDING_PAYMENT",
    },

    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String, default: null },

    paymentMethod: {
      type: String,
      enum: ["TRADE_WALLET", "COD"],
      default: "TRADE_WALLET",
    },

    orderNumber: {
      type: String,
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
    },

    cancelledAt: Date,

    returnWindowEndsAt: Date,

    // Vendor-to-vendor deal order
    dealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deal",
      default: null,
    },
    isDealOrder: { type: Boolean, default: false },
  },

  { timestamps: true }
);

orderSchema.index({ buyerId: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ "items.vendorId": 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });

orderSchema.pre("save", async function() {
  if (!this.orderNumber) {
    this.orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random()*10000)}`;
  }
  // Auto-add initial tracking event
  if (this.isNew && this.deliveryTracking.length === 0) {
    this.deliveryTracking.push({
      status: "ORDER_PLACED",
      message: "Your order has been placed successfully",
      timestamp: new Date(),
    });
  }
});

export const Order = mongoose.model("Order", orderSchema);
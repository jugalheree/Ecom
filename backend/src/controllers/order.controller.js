import mongoose from "mongoose";
import { Cart } from "../models/order/Cart.model.js";
import { Order } from "../models/order/Order.model.js";
import { Product } from "../models/product/Product.model.js";
import { AdvancedOrder } from "../models/order/AdvancedOrder.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Vendor } from "../models/vendor/Vendor.model.js";
import { ReturnRequest } from "../models/order/ReturnRequest.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { TradeWallet } from "../models/finance/TradeWallet.model.js";
import { WalletTransaction } from "../models/finance/WalletTransaction.model.js";
import { Coupon } from "../models/finance/Coupon.model.js";
import { User } from "../models/auth/User.model.js";
import { sendOrderConfirmationEmail } from "../utils/email.js";

const RETURN_WINDOW_DAYS = 7;
const PAYMENT_EXPIRY_MINUTES = 15;

export const placeOrder = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const buyerId = req.user._id;
    const {
      selectedProductIds,
      scheduledDate,
      isRecurring,
      recurringIntervalDays,
      deliveryAddress,
      couponCode,
      paymentMethod = "TRADE_WALLET",
    } = req.body;

    // ── Payment method validation ──
    const ALLOWED_PAYMENT_METHODS = ["TRADE_WALLET", "COD"];
    if (!ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
      throw new ApiError(400, `Invalid payment method. Allowed: ${ALLOWED_PAYMENT_METHODS.join(", ")}`);
    }

    // -------------------------
    // ✅ Basic Validation
    // -------------------------
    if (!Array.isArray(selectedProductIds) || selectedProductIds.length === 0) {
      throw new ApiError(400, "No products selected");
    }

    const uniqueIds = [...new Set(selectedProductIds)];

    if (isRecurring && (!recurringIntervalDays || recurringIntervalDays <= 0)) {
      throw new ApiError(400, "Valid recurring interval required");
    }

    // FIX: Validate scheduledDate EARLY — before any DB writes or stock deductions
    if (scheduledDate) {
      const scheduled = new Date(scheduledDate);
      if (isNaN(scheduled.getTime())) {
        throw new ApiError(400, "Invalid scheduled date format");
      }
      if (scheduled <= new Date()) {
        throw new ApiError(400, "Scheduled date must be in the future");
      }
    }

    // -------------------------
    // ✅ Fetch Cart
    // -------------------------
    const cart = await Cart.findOne({ userId: buyerId }).session(session);

    if (!cart || cart.items.length === 0) {
      throw new ApiError(400, "Cart is empty");
    }

    const selectedItems = cart.items.filter((item) =>
      uniqueIds.includes(item.productId.toString())
    );

    if (selectedItems.length === 0) {
      throw new ApiError(400, "Selected items not found in cart");
    }

    // -------------------------
    // ✅ Fetch Products in Bulk
    // -------------------------
    const products = await Product.find({
      _id: { $in: selectedItems.map((i) => i.productId) },
      approvalStatus: "APPROVED",
      isActive: true,
    }).session(session);

    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    let totalAmount = 0;
    const orderItems = [];
    const bulkStockOps = [];

    // -------------------------
    // ✅ Validate Each Item
    // -------------------------
    for (const item of selectedItems) {
      const product = productMap.get(item.productId.toString());

      if (!product) {
        throw new ApiError(400, "Product unavailable");
      }

      // B2B validation
      if (product.saleType === "B2B" && !req.user.isB2B) {
        throw new ApiError(
          403,
          `Product ${product.title} is available for B2B buyers only`
        );
      }

      // Min quantity
      if (item.quantity < product.minOrderQty) {
        throw new ApiError(
          400,
          `Minimum quantity not met for ${product.title}`
        );
      }

      // Max quantity
      if (product.maxOrderQty && item.quantity > product.maxOrderQty) {
        throw new ApiError(
          400,
          `Maximum quantity exceeded for ${product.title}`
        );
      }

      // Price protection
      if (item.priceAtTime !== product.price) {
        throw new ApiError(
          400,
          `Price changed for ${product.title}. Please refresh cart.`
        );
      }

      // Prepare stock update
      bulkStockOps.push({
        updateOne: {
          filter: {
            _id: product._id,
            stock: { $gte: item.quantity },
          },
          update: { $inc: { stock: -item.quantity } },
        },
      });

      totalAmount += item.priceAtTime * item.quantity;

      orderItems.push({
        productId: product._id,
        vendorId: product.vendorId,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtTime,
      });
    }

    // -------------------------
    // ✅ Execute Safe Stock Deduction
    // -------------------------
    const bulkResult = await Product.bulkWrite(bulkStockOps, { session });

    if (bulkResult.modifiedCount !== selectedItems.length) {
      throw new ApiError(400, "One or more items are out of stock. Please refresh your cart.");
    }

    // -------------------------
    // ✅ Apply Coupon (if provided)
    // -------------------------
    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      appliedCoupon = await Coupon.findOne({
        code: couponCode.toUpperCase().trim(),
        isActive: true,
      }).session(session);

      if (!appliedCoupon) throw new ApiError(400, "Invalid or inactive coupon code");
      if (appliedCoupon.expiresAt && new Date() > appliedCoupon.expiresAt) throw new ApiError(400, "Coupon has expired");
      if (appliedCoupon.usageLimit !== null && appliedCoupon.usedCount >= appliedCoupon.usageLimit) {
        throw new ApiError(400, "Coupon usage limit reached");
      }
      if (totalAmount < appliedCoupon.minOrderValue) {
        throw new ApiError(400, `Minimum order of ₹${appliedCoupon.minOrderValue} required for this coupon`);
      }

      if (appliedCoupon.discountType === "PERCENT") {
        discountAmount = Math.round((totalAmount * appliedCoupon.discountValue) / 100);
        if (appliedCoupon.maxDiscount) discountAmount = Math.min(discountAmount, appliedCoupon.maxDiscount);
      } else {
        discountAmount = Math.min(appliedCoupon.discountValue, totalAmount);
      }
    }

    const finalAmount = Math.max(0, totalAmount - discountAmount);

    // -------------------------
    // ✅ Wallet Payment (if selected)
    // -------------------------
    let wallet = null;
    if (paymentMethod === "TRADE_WALLET") {
      wallet = await TradeWallet.findOne({ userId: buyerId }).session(session);
      if (!wallet) throw new ApiError(400, "Wallet not found. Please add funds first.");
      const available = wallet.balance - wallet.locked;
      if (available < finalAmount) {
        throw new ApiError(400, `Insufficient wallet balance. Available: ₹${available.toFixed(2)}, Required: ₹${finalAmount.toFixed(2)}`);
      }
      wallet.balance -= finalAmount;
      await wallet.save({ session });
    }

    // -------------------------
    // ✅ Create Order
    // -------------------------
    const returnWindowEndsAt = new Date();
    returnWindowEndsAt.setDate(
      returnWindowEndsAt.getDate() + RETURN_WINDOW_DAYS
    );

    // Estimate delivery: find max delivery days across items
    const maxDeliveryDays = Math.max(
      ...orderItems.map((oi) => {
        const p = productMap.get(oi.productId.toString());
        return p?.maxDeliveryDays || 5;
      })
    );
    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + maxDeliveryDays);

    const isWalletPaid = paymentMethod === "TRADE_WALLET";

    const [order] = await Order.create(
      [
        {
          buyerId,
          items: orderItems,
          totalAmount: finalAmount,
          discountAmount,
          couponCode: appliedCoupon?.code,
          deliveryAddress: deliveryAddress || {},
          estimatedDeliveryDate,
          deliveryTracking: [
            {
              status: "ORDER_PLACED",
              message: "Your order has been placed successfully",
              timestamp: new Date(),
            },
            ...(isWalletPaid ? [{
              status: "PAYMENT_CONFIRMED",
              message: "Payment received via Trade Wallet",
              timestamp: new Date(),
            }] : []),
          ],
          paymentMethod,
          orderStatus: isWalletPaid ? "CONFIRMED" : "PENDING_PAYMENT",
          paymentStatus: isWalletPaid ? "PAID" : "PENDING",
          paymentExpiresAt: isWalletPaid ? undefined : new Date(
            Date.now() + PAYMENT_EXPIRY_MINUTES * 60 * 1000
          ),
          returnWindowEndsAt,
        },
      ],
      { session }
    );

    // Record wallet debit transaction
    if (isWalletPaid) {
      await WalletTransaction.create([{
        userId: buyerId,
        type: "DEBIT",
        amount: finalAmount,
        description: `Payment for order #${order._id}`,
        status: "COMPLETED",
        orderId: order._id,
      }], { session });
    }

    // Increment coupon usage count atomically
    if (appliedCoupon) {
      await Coupon.findByIdAndUpdate(appliedCoupon._id, { $inc: { usedCount: 1 } }, { session });
    }

    // -------------------------
    // ✅ Handle Scheduled / Recurring
    // -------------------------
    if (scheduledDate) {
      const scheduled = new Date(scheduledDate);
      // (Validation already done at the top of this function)

      await AdvancedOrder.create(
        [
          {
            orderId: order._id,
            userId: buyerId,
            scheduledDate: scheduled,
            isRecurring: !!isRecurring,
            recurringIntervalDays: isRecurring
              ? recurringIntervalDays
              : undefined,
            nextExecutionDate: isRecurring ? scheduled : undefined,
          },
        ],
        { session }
      );
    }

    // -------------------------
    // ✅ Remove Selected Items from Cart
    // -------------------------
    await Cart.updateOne(
      { userId: buyerId },
      {
        $pull: {
          items: {
            productId: { $in: uniqueIds },
          },
        },
      },
      { session }
    );

    // -------------------------
    // ✅ Commit Transaction
    // -------------------------
    await session.commitTransaction();
    session.endSession();

    // Send order confirmation email (non-blocking)
    try {
      const buyer = await User.findById(buyerId).select("email name").lean();
      if (buyer?.email) {
        const itemsForEmail = orderItems.map((oi) => {
          const p = productMap.get(oi.productId.toString());
          return { title: p?.title, quantity: oi.quantity, priceAtPurchase: oi.priceAtPurchase };
        });
        sendOrderConfirmationEmail(buyer.email, buyer.name, { ...order.toObject(), items: itemsForEmail }).catch(() => {});
      }
    } catch {}

    const successMsg = isWalletPaid
      ? "Order placed and payment confirmed!"
      : "Order placed successfully. Complete payment to confirm.";

    return res
      .status(201)
      .json(new ApiResponse(201, order, successMsg));
  } catch (error) {
    // -------------------------
    // ❌ Rollback on Error
    // -------------------------
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

// POST /api/orders/place/:orderId/pay — pay a pending order via Trade Wallet
export const walletPayOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid order ID");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findOne({ _id: orderId, buyerId: userId }).session(session);
    if (!order) throw new ApiError(404, "Order not found");
    if (order.paymentStatus === "PAID") throw new ApiError(400, "Order already paid");
    if (order.paymentExpiresAt && order.paymentExpiresAt < new Date()) {
      throw new ApiError(400, "Payment window has expired. Please place a new order.");
    }

    const wallet = await TradeWallet.findOne({ userId }).session(session);
    if (!wallet) throw new ApiError(400, "Wallet not found. Please add funds first.");

    const available = wallet.balance - wallet.locked;
    if (available < order.totalAmount) {
      throw new ApiError(400, `Insufficient wallet balance. Available: ₹${available.toFixed(2)}, Required: ₹${order.totalAmount.toFixed(2)}`);
    }

    wallet.balance -= order.totalAmount;
    await wallet.save({ session });

    await WalletTransaction.create([{
      userId,
      type: "DEBIT",
      amount: order.totalAmount,
      description: `Payment for order #${order._id}`,
      status: "COMPLETED",
      orderId: order._id,
    }], { session });

    order.paymentStatus = "PAID";
    order.paymentMethod = "TRADE_WALLET";
    order.orderStatus = "CONFIRMED";
    order.deliveryTracking.push({
      status: "PAYMENT_CONFIRMED",
      message: "Payment received via Trade Wallet",
      timestamp: new Date(),
    });
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json(new ApiResponse(200, order, "Payment successful. Order confirmed!"));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

// get all orders for a user
export const getMyOrders = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  let { page = 1, limit = 10, status } = req.query;

  page = Math.max(parseInt(page), 1);
  limit = Math.min(Math.max(parseInt(limit), 1), 50);

  const filter = { buyerId: userId };

  if (status) {
    filter.orderStatus = status;
  }

  const skip = (page - 1) * limit;

  const [orders, totalOrders] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "items.productId",
        select: "title price",
      })
      .lean(),

    Order.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        orders,
        pagination: {
          total: totalOrders,
          page,
          limit,
          totalPages: Math.ceil(totalOrders / limit),
        },
      },
      "Orders fetched successfully"
    )
  );
});

//get order details
export const getOrderDetails = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid order id");
  }

  const [order, advancedOrder] = await Promise.all([
    Order.findById(orderId)
      .populate({
        path: "items.productId",
        select: "title price",
      })
      .populate({
        path: "items.vendorId",
        select: "shopName",
      })
      .lean(),

    AdvancedOrder.findOne({ orderId }).lean(),
  ]);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.buyerId.toString() !== userId.toString()) {
    throw new ApiError(403, "Unauthorized access");
  }

  const ProductImage = mongoose.model("ProductImage");

  const productIds = order.items.map((i) => i.productId._id);

  const images = await ProductImage.find({
    productId: { $in: productIds },
    isActive: true,
  })
    .sort({ order: 1 })
    .select("imageUrl isPrimary productId")
    .lean();

  const imageMap = {};

  images.forEach((img) => {
    const key = img.productId.toString();
    if (!imageMap[key]) imageMap[key] = [];
    imageMap[key].push(img);
  });

  order.items.forEach((item) => {
    item.productImages = imageMap[item.productId._id.toString()] || [];
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        order: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          totalAmount: order.totalAmount,
          returnWindowEndsAt: order.returnWindowEndsAt,
          createdAt: order.createdAt,
          items: order.items,
        },
        advancedOrder,
      },
      "Order details fetched successfully"
    )
  );
});

// get orders for vendor's products
export const getVendorOrders = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  let { page = 1, limit = 10, status } = req.query;

  page = Math.max(parseInt(page), 1);
  limit = Math.min(Math.max(parseInt(limit), 1), 50);

  const vendor = await Vendor.findOne({ userId }).lean();

  if (!vendor) {
    throw new ApiError(404, "Vendor profile not found");
  }

  const matchStage = {
    "items.vendorId": vendor._id,
  };

  if (status) {
    matchStage.orderStatus = status;
  }

  const pipeline = [
    { $match: matchStage },

    { $sort: { createdAt: -1 } },

    {
      $addFields: {
        items: {
          $filter: {
            input: "$items",
            as: "item",
            cond: { $eq: ["$$item.vendorId", vendor._id] },
          },
        },
      },
    },

    {
      $lookup: {
        from: "products",
        localField: "items.productId",
        foreignField: "_id",
        as: "productDetails",
      },
    },

    // Lookup buyer name
    {
      $lookup: {
        from: "users",
        localField: "buyerId",
        foreignField: "_id",
        as: "buyerInfo",
      },
    },
    { $unwind: { path: "$buyerInfo", preserveNullAndEmptyArrays: true } },

    {
      $project: {
        orderNumber: 1,
        orderStatus: 1,
        paymentStatus: 1,
        createdAt: 1,
        totalAmount: 1,
        deliveryAddress: 1,
        items: 1,
        productDetails: 1,
        buyerName: "$buyerInfo.name",
        buyerPhone: "$buyerInfo.phone",
      },
    },

    { $skip: (page - 1) * limit },

    { $limit: limit },
  ];

  const [orders, totalCount] = await Promise.all([
    Order.aggregate(pipeline),
    Order.aggregate([{ $match: matchStage }, { $count: "total" }]),
  ]);

  const total = totalCount[0]?.total || 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        orders,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Vendor orders fetched successfully"
    )
  );
});

export const shipOrderItem = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { productId, action } = req.body; // action: PACK | PICKUP | SHIP | OUT_FOR_DELIVERY | DELIVER
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid order ID");
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID");
  }

  const vendor = await Vendor.findOne({ userId }).lean();

  if (!vendor) {
    throw new ApiError(404, "Vendor profile not found");
  }

  const order = await Order.findOne({
    _id: orderId,
    "items.productId": productId,
    "items.vendorId": vendor._id,
  });

  if (!order) {
    throw new ApiError(403, "You cannot update this product");
  }

  if (order.orderStatus === "CANCELLED") {
    throw new ApiError(400, "Order is cancelled");
  }

  const item = order.items.find(
    (i) =>
      i.productId.toString() === productId &&
      i.vendorId.toString() === vendor._id.toString()
  );

  const trackingStep = action || "SHIP";

  // Status machine
  const statusMap = {
    PACK: { itemStatus: "PACKED", orderStatus: "PROCESSING", trackStatus: "PACKED", msg: "Your order has been packed and is ready for pickup" },
    PICKUP: { itemStatus: "PICKED_UP", orderStatus: "PICKED_UP", trackStatus: "PICKED_UP", msg: "Order picked up by delivery partner" },
    SHIP: { itemStatus: "SHIPPED", orderStatus: "SHIPPED", trackStatus: "IN_TRANSIT", msg: "Your order is on its way!" },
    OUT_FOR_DELIVERY: { itemStatus: "OUT_FOR_DELIVERY", orderStatus: "OUT_FOR_DELIVERY", trackStatus: "OUT_FOR_DELIVERY", msg: "Out for delivery — your order will arrive today!" },
    DELIVER: { itemStatus: "DELIVERED", orderStatus: "DELIVERED", trackStatus: "DELIVERED", msg: "Order delivered successfully. Enjoy your purchase!" },
  };

  const step = statusMap[trackingStep] || statusMap.SHIP;

  item.status = step.itemStatus;
  if (step.itemStatus === "SHIPPED") item.shippedAt = new Date();
  if (step.itemStatus === "PACKED") item.packedAt = new Date();
  if (step.itemStatus === "PICKED_UP") item.pickedUpAt = new Date();
  if (step.itemStatus === "OUT_FOR_DELIVERY") item.outForDeliveryAt = new Date();
  if (step.itemStatus === "DELIVERED") item.deliveredAt = new Date();

  // Check if all items have the same or later status
  const allAtStatus = order.items.every((i) => i.status === step.itemStatus || i.status === "DELIVERED");
  if (allAtStatus) {
    order.orderStatus = step.orderStatus;
  }

  // Add tracking entry
  order.deliveryTracking.push({
    status: step.trackStatus,
    message: step.msg,
    timestamp: new Date(),
  });

  // If delivered, also add tracking + update vendor stats
  if (step.itemStatus === "DELIVERED") {
    // Update vendor delivery speed score (simplified)
    const diffMs = new Date() - order.createdAt;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    const expectedDays = 5; // default
    const speedScore = diffDays <= expectedDays ? 10 : Math.max(1, 10 - (diffDays - expectedDays));
    await Vendor.findByIdAndUpdate(vendor._id, {
      $inc: { totalOrders: 1 },
      $set: { deliverySpeedScore: speedScore },
    });
  }

  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Item marked as shipped"));
});

// buyer confirms delivery of an item
export const confirmDelivery = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { productId } = req.body;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid order ID");
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID");
  }

  const order = await Order.findOne({
    _id: orderId,
    buyerId: userId,
    "items.productId": productId,
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (["CANCELLED", "REFUNDED", "RETURNED"].includes(order.orderStatus)) {
    throw new ApiError(400, "Order cannot be delivered");
  }

  const item = order.items.find((i) => i.productId.toString() === productId);

  if (!item) {
    throw new ApiError(404, "Item not found in order");
  }

  if (item.status === "DELIVERED") {
    throw new ApiError(400, "Item already delivered");
  }

  if (item.status !== "SHIPPED" && item.status !== "OUT_FOR_DELIVERY") {
    throw new ApiError(400, "Item is not shipped yet");
  }

  item.status = "DELIVERED";
  item.deliveredAt = new Date();

  const allDelivered = order.items.every((i) => i.status === "DELIVERED");

  if (allDelivered) {
    order.orderStatus = "DELIVERED";
  }

  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Delivery confirmed successfully"));
});

// cancel order by buyer
export const cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid order ID");
  }

  // FIX: Wrap in a session/transaction so stock restore and order update are atomic
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findOne({
      _id: orderId,
      buyerId: userId,
    }).session(session);

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    if (["CANCELLED", "DELIVERED", "COMPLETED"].includes(order.orderStatus)) {
      throw new ApiError(400, "Order cannot be cancelled");
    }

    const shippedItem = order.items.some(
      (item) =>
        item.status === "SHIPPED" ||
        item.status === "OUT_FOR_DELIVERY" ||
        item.status === "DELIVERED"
    );

    if (shippedItem) {
      throw new ApiError(
        400,
        "Order cannot be cancelled because items are already shipped"
      );
    }

    // Restore stock atomically within the transaction
    const bulkStockOps = order.items.map((item) => ({
      updateOne: {
        filter: { _id: item.productId },
        update: { $inc: { stock: item.quantity } },
      },
    }));

    await Product.bulkWrite(bulkStockOps, { session });

    // Refund wallet if payment was via Trade Wallet
    if (order.paymentMethod === "TRADE_WALLET" && order.paymentStatus === "PAID") {
      const wallet = await TradeWallet.findOne({ userId }).session(session);
      if (wallet) {
        wallet.balance = Math.round((wallet.balance + order.totalAmount) * 100) / 100;
        await wallet.save({ session });
        await WalletTransaction.create([{
          userId,
          type: "CREDIT",
          amount: order.totalAmount,
          description: `Refund for cancelled order #${order._id}`,
          status: "COMPLETED",
          orderId: order._id,
        }], { session });
      }
    }

    // Cancel all items
    order.items.forEach((item) => {
      item.status = "CANCELLED";
    });

    order.orderStatus = "CANCELLED";
    order.cancelledAt = new Date();

    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res
      .status(200)
      .json(new ApiResponse(200, order, "Order cancelled successfully"));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});




// return request by buyer for product

export const requestReturn = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { productId, reason, description, images } = req.body;
  const buyerId = req.user._id;
  const quantity = Number(req.body.quantity);

  const uploadedImages = [];

  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const result = await uploadOnCloudinary(file.path);

      if (result) {
        uploadedImages.push(result.secure_url);
      }
    }
  }

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid order ID");
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID");
  }

  if (!reason) {
    throw new ApiError(400, "Return reason is required");
  }

  const order = await Order.findOne({
    _id: orderId,
    buyerId,
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.orderStatus !== "DELIVERED") {
    throw new ApiError(400, "Return allowed only after delivery");
  }

  if (order.returnWindowEndsAt < new Date()) {
    throw new ApiError(400, "Return window expired");
  }

  const item = order.items.find((i) => i.productId.toString() === productId);

  if (!item) {
    throw new ApiError(404, "Product not found in order");
  }

  if (!quantity || quantity <= 0 || quantity > item.quantity) {
    throw new ApiError(400, "Invalid return quantity");
  }

  const previousReturns = await ReturnRequest.aggregate([
    {
      $match: {
        orderId: order._id,
        productId: new mongoose.Types.ObjectId(productId),
        buyerId,
      },
    },
    {
      $group: {
        _id: null,
        totalReturned: { $sum: "$quantity" },
      },
    },
  ]);

  const alreadyReturned =
    previousReturns.length > 0 ? previousReturns[0].totalReturned : 0;

  if (alreadyReturned + quantity > item.quantity) {
    throw new ApiError(400, "Return quantity exceeds purchased quantity");
  }

  if (["RETURN_REQUESTED", "RETURNED", "REFUNDED"].includes(item.status)) {
    throw new ApiError(400, "Return already requested for this item");
  }

  const existingReturn = await ReturnRequest.findOne({
    orderId,
    productId,
    buyerId,
    status: { $nin: ["REJECTED"] },
  });

  if (existingReturn) {
    throw new ApiError(400, "Return already requested for this item");
  }

  const returnRequest = await ReturnRequest.create({
    orderId,
    productId,
    vendorId: item.vendorId,
    buyerId,
    quantity,
    reason,
    description,
    images: uploadedImages,
  });

  item.status = "RETURN_REQUESTED";

  await order.save();

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        returnRequest,
        "Return request submitted successfully"
      )
    );
});


// review of return request by vendor - approve or reject return request
export const reviewReturnRequest = asyncHandler(async (req, res) => {

  const { returnId } = req.params;
  const { action, remark } = req.body;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(returnId)) {
    throw new ApiError(400, "Invalid return request id");
  }

  if (!["APPROVE", "REJECT"].includes(action)) {
    throw new ApiError(400, "Invalid action");
  }

  if (action === "REJECT" && !remark) {
    throw new ApiError(400, "Rejection remark is required");
  }

  const vendor = await Vendor.findOne({ userId });

  if (!vendor) {
    throw new ApiError(404, "Vendor profile not found");
  }

  const returnRequest = await ReturnRequest.findOne({
    _id: returnId,
    vendorId: vendor._id
  });

  if (!returnRequest) {
    throw new ApiError(404, "Return request not found");
  }

  if (returnRequest.status !== "REQUESTED") {
    throw new ApiError(400, "Return already processed");
  }

  if (action === "APPROVE") {
    returnRequest.status = "APPROVED";
    returnRequest.approvedAt = new Date();
  } 
  else {
    returnRequest.status = "REJECTED";
    returnRequest.rejectedAt = new Date();

    // Reset the order item status back to DELIVERED so buyer can re-request if within window
    const order = await Order.findById(returnRequest.orderId);
    if (order) {
      const item = order.items.find(
        (i) => i.productId.toString() === returnRequest.productId.toString()
      );
      if (item && item.status === "RETURN_REQUESTED") {
        item.status = "DELIVERED";
        await order.save();
      }
    }
  }

  returnRequest.vendorRemark = remark;

  await returnRequest.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      returnRequest,
      "Return request processed successfully"
    )
  );

});



// product pickup from buyer for return - vendor initiates pickup after approving return request
export const markReturnPickedUp = asyncHandler(async (req, res) => {

  const { returnId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(returnId)) {
    throw new ApiError(400, "Invalid return id");
  }

  // FIX: Verify the requesting user is the vendor who owns this return request
  const vendor = await Vendor.findOne({ userId });
  if (!vendor) {
    throw new ApiError(404, "Vendor profile not found");
  }

  const returnRequest = await ReturnRequest.findOne({
    _id: returnId,
    vendorId: vendor._id,  // FIX: scoped to this vendor — was fetching by ID alone
  });

  if (!returnRequest) {
    throw new ApiError(404, "Return request not found");
  }

  if (returnRequest.status === "PICKED_UP") {
    throw new ApiError(400, "Return already picked up");
  }

  if (returnRequest.status !== "APPROVED") {
    throw new ApiError(400, "Return must be approved first");
  }

  returnRequest.status = "PICKED_UP";
  returnRequest.pickedUpAt = new Date();

  await returnRequest.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      returnRequest,
      "Return item picked up successfully"
    )
  );

});




// return product received by vendor
export const markReturnReceived = asyncHandler(async (req, res) => {

  const { returnId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(returnId)) {
    throw new ApiError(400, "Invalid return id");
  }

  const vendor = await Vendor.findOne({ userId });

  if (!vendor) {
    throw new ApiError(404, "Vendor profile not found");
  }

  const returnRequest = await ReturnRequest.findOne({
    _id: returnId,
    vendorId: vendor._id
  });

  if (!returnRequest) {
    throw new ApiError(404, "Return request not found");
  }

  if (returnRequest.status === "RECEIVED") {
    throw new ApiError(400, "Return already received");
  }

  if (returnRequest.status !== "PICKED_UP") {
    throw new ApiError(400, "Return must be picked up first");
  }

  returnRequest.status = "RECEIVED";
  returnRequest.receivedAt = new Date();

  await returnRequest.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      returnRequest,
      "Returned item received by vendor"
    )
  );

});




// refund request
export const refundReturnRequest = asyncHandler(async (req, res) => {
  const { returnId } = req.params;
  const { refundAmount, refundMethod, adminRemark } = req.body;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(returnId)) {
    throw new ApiError(400, "Invalid return id");
  }

  const returnRequest = await ReturnRequest.findById(returnId);

  if (!returnRequest) {
    throw new ApiError(404, "Return request not found");
  }

  if (returnRequest.status === "REFUNDED") {
    throw new ApiError(400, "Refund already processed");
  }

  if (returnRequest.status !== "RECEIVED") {
    throw new ApiError(400, "Item must be received before refund");
  }

  // update return request
  returnRequest.status = "REFUNDED";
  returnRequest.refundedAt = new Date();
  returnRequest.refundAmount = refundAmount;
  returnRequest.refundMethod = refundMethod;
  returnRequest.adminRemark = adminRemark;

  await returnRequest.save();

  // update order item + optionally credit wallet
  const order = await Order.findById(returnRequest.orderId);

  if (order) {
    const item = order.items.find(
      (i) =>
        i.productId.toString() ===
        returnRequest.productId.toString()
    );

    if (item) {
      item.status = "REFUNDED";
    }

    // check if all items refunded
    const allRefunded = order.items.every(
      (i) => i.status === "REFUNDED"
    );

    if (allRefunded) {
      order.orderStatus = "REFUNDED";
      order.paymentStatus = "REFUNDED";
    }

    await order.save();

    // ── Credit refund to buyer's wallet ─────────────────────────────
    // Refund goes to wallet if: method is TRADE_WALLET, or original payment was wallet
    const shouldCreditWallet =
      refundMethod === "TRADE_WALLET" ||
      refundMethod === "WALLET" ||
      order.paymentMethod === "TRADE_WALLET";

    if (shouldCreditWallet && refundAmount > 0) {
      const buyerWallet = await TradeWallet.findOneAndUpdate(
        { userId: order.buyerId },
        { $inc: { balance: refundAmount } },
        { upsert: true, new: true }
      );

      await WalletTransaction.create({
        userId: order.buyerId,
        type: "CREDIT",
        amount: refundAmount,
        description: `Refund for order #${order.orderNumber || order._id.toString().slice(-8).toUpperCase()}`,
        status: "COMPLETED",
        reference: order._id,
        referenceModel: "Order",
      });
    }
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { ...returnRequest.toObject(), walletCredited: refundMethod === "TRADE_WALLET" || order?.paymentMethod === "TRADE_WALLET" },
      "Refund processed successfully"
    )
  );
});




// order status
export const getOrderTimeline = asyncHandler(async (req, res) => {

  const { orderId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new ApiError(400, "Invalid order id");
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.buyerId.toString() !== userId.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  const timeline = [];

  // Order created
  timeline.push({
    status: "ORDER_PLACED",
    message: "Order placed successfully",
    time: order.createdAt
  });

  // Payment
  if (order.paymentStatus === "PAID") {
    timeline.push({
      status: "PAYMENT_CONFIRMED",
      message: "Payment confirmed",
      time: order.updatedAt
    });
  }

  // Shipped
  const shippedItems = order.items.filter(i => i.shippedAt);

  if (shippedItems.length > 0) {
    timeline.push({
      status: "ITEM_SHIPPED",
      message: "Vendor shipped the item",
      time: shippedItems[0].shippedAt
    });
  }

  // Delivered
  const deliveredItems = order.items.filter(i => i.deliveredAt);

  if (deliveredItems.length > 0) {
    timeline.push({
      status: "DELIVERED",
      message: "Order delivered",
      time: deliveredItems[0].deliveredAt
    });
  }

  // Return timeline
  const returnRequests = await ReturnRequest.find({ orderId });

  for (const r of returnRequests) {

    timeline.push({
      status: "RETURN_REQUESTED",
      message: "Return requested",
      time: r.requestedAt
    });

    if (r.approvedAt) {
      timeline.push({
        status: "RETURN_APPROVED",
        message: "Vendor approved return",
        time: r.approvedAt
      });
    }

    if (r.pickedUpAt) {
      timeline.push({
        status: "RETURN_PICKED_UP",
        message: "Item picked up",
        time: r.pickedUpAt
      });
    }

    if (r.receivedAt) {
      timeline.push({
        status: "RETURN_RECEIVED",
        message: "Vendor received returned item",
        time: r.receivedAt
      });
    }

    if (r.refundedAt) {
      timeline.push({
        status: "REFUND_COMPLETED",
        message: "Refund completed",
        time: r.refundedAt
      });
    }
  }

  // sort timeline
  timeline.sort((a, b) => new Date(a.time) - new Date(b.time));

  return res.status(200).json(
    new ApiResponse(
      200,
      timeline,
      "Order timeline fetched successfully"
    )
  );

});

// ── Get vendor return requests ─────────────────────────────────────────────
export const getVendorReturns = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user._id }).lean();
  if (!vendor) throw new ApiError(404, "Vendor profile not found");

  const { status } = req.query;
  const filter = { vendorId: vendor._id };
  if (status) filter.status = status;

  const returns = await ReturnRequest.find(filter)
    .populate("orderId", "orderNumber totalAmount")
    .populate("productId", "title primaryImage price")
    .populate("buyerId", "name email phone")
    .sort({ createdAt: -1 })
    .lean();

  return res.status(200).json(new ApiResponse(200, returns, "Return requests fetched"));
});
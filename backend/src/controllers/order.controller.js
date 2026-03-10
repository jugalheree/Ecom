import mongoose from "mongoose";
import { Cart } from "../models/order/Cart.model.js";
import { Order } from "../models/order/Order.model.js";
import { Product } from "../models/product/Product.model.js";
import { AdvancedOrder } from "../models/order/AdvancedOrder.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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
    } = req.body;

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

    const productMap = new Map(
      products.map((p) => [p._id.toString(), p])
    );

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
      if (
        product.maxOrderQty &&
        item.quantity > product.maxOrderQty
      ) {
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
      throw new ApiError(400, "Stock issue detected");
    }

    // -------------------------
    // ✅ Create Order
    // -------------------------
    const returnWindowEndsAt = new Date();
    returnWindowEndsAt.setDate(
      returnWindowEndsAt.getDate() + RETURN_WINDOW_DAYS
    );

    const [order] = await Order.create(
      [
        {
          buyerId,
          items: orderItems,
          totalAmount,
          paymentMethod: "DUMMY",
          orderStatus: "PENDING_PAYMENT",
          paymentStatus: "PENDING",
          paymentExpiresAt: new Date(
            Date.now() + PAYMENT_EXPIRY_MINUTES * 60 * 1000
          ),
          returnWindowEndsAt,
        },
      ],
      { session }
    );

    // -------------------------
    // ✅ Handle Scheduled / Recurring
    // -------------------------
    if (scheduledDate) {
      const scheduled = new Date(scheduledDate);

      if (scheduled <= new Date()) {
        throw new ApiError(400, "Scheduled date must be future");
      }

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

    return res.status(201).json(
      new ApiResponse(
        201,
        order,
        "Order placed successfully. Awaiting payment."
      )
    );

  } catch (error) {
    // -------------------------
    // ❌ Rollback on Error
    // -------------------------
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});



//dummy payments api
export const dummyPayOrder = asyncHandler(async (req, res) => {

  const { orderId } = req.params;
  const userId = req.user._id;

  const order = await Order.findOne({
    _id: orderId,
    buyerId: userId,
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.paymentStatus === "PAID") {
    throw new ApiError(400, "Order already paid");
  }

  if (order.paymentExpiresAt && order.paymentExpiresAt < new Date()) {
    throw new ApiError(400, "Payment window expired");
  }

  order.paymentStatus = "PAID";
  order.orderStatus = "CONFIRMED";

  await order.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      order,
      "Dummy payment successful"
    )
  );
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

  const productIds = order.items.map(i => i.productId._id);

  const images = await ProductImage.find({
    productId: { $in: productIds },
    isActive: true
  })
  .sort({ order: 1 })
  .select("imageUrl isPrimary productId")
  .lean();

  const imageMap = {};

  images.forEach(img => {
    const key = img.productId.toString();
    if (!imageMap[key]) imageMap[key] = [];
    imageMap[key].push(img);
  });

  order.items.forEach(item => {
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
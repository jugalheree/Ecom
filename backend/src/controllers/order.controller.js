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
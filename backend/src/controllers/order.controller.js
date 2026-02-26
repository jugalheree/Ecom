import mongoose from "mongoose";
import { Cart } from "../models/order/Cart.model.js";
import { Order } from "../models/order/Order.model.js";
import { Product } from "../models/product/Product.model.js";
import { AdvancedOrder } from "../models/order/AdvancedOrder.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const placeOrder = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const buyerId = req.user._id;
    const { selectedProductIds, scheduledDate, isRecurring, recurringIntervalDays } = req.body;

    if (!Array.isArray(selectedProductIds) || selectedProductIds.length === 0) {
      throw new ApiError(400, "No products selected");
    }

    const cart = await Cart.findOne({ userId: buyerId }).session(session);
    if (!cart || cart.items.length === 0) {
      throw new ApiError(400, "Cart is empty");
    }

    const selectedItems = cart.items.filter(item =>
      selectedProductIds.includes(item.productId.toString())
    );

    if (selectedItems.length === 0) {
      throw new ApiError(400, "Selected items not found in cart");
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of selectedItems) {
      const product = await Product.findOne({
        _id: item.productId,
        approvalStatus: "APPROVED",
        isActive: true,
      }).session(session);

      if (!product) {
        throw new ApiError(400, "Product unavailable");
      }

      if (item.quantity < product.minOrderQty) {
        throw new ApiError(400, `Minimum quantity not met for ${product.title}`);
      }

      if (product.maxOrderQty && item.quantity > product.maxOrderQty) {
        throw new ApiError(400, `Maximum quantity exceeded for ${product.title}`);
      }

      // Safe stock deduction
      const stockUpdate = await Product.findOneAndUpdate(
        {
          _id: product._id,
          stock: { $gte: item.quantity },
        },
        { $inc: { stock: -item.quantity } },
        { new: true, session }
      );

      if (!stockUpdate) {
        throw new ApiError(400, `Insufficient stock for ${product.title}`);
      }

      totalAmount += product.price * item.quantity;

      orderItems.push({
        productId: product._id,
        vendorId: product.vendorId,
        quantity: item.quantity,
        priceAtPurchase: product.price,
      });
    }

    const returnWindowEndsAt = new Date();
    returnWindowEndsAt.setDate(returnWindowEndsAt.getDate() + 7);

    const order = await Order.create(
      [{
        buyerId,
        items: orderItems,
        totalAmount,
        orderStatus: "PENDING_PAYMENT",
        paymentStatus: "PENDING",
        returnWindowEndsAt,
      }],
      { session }
    );

    // Scheduled Order Handling
    if (scheduledDate) {
      const scheduled = new Date(scheduledDate);
      if (scheduled <= new Date()) {
        throw new ApiError(400, "Scheduled date must be in future");
      }

      await AdvancedOrder.create(
        [{
          orderId: order[0]._id,
          userId: buyerId,
          scheduledDate: scheduled,
          isRecurring: isRecurring || false,
          recurringIntervalDays: isRecurring ? recurringIntervalDays : undefined,
          nextExecutionDate: isRecurring ? scheduled : undefined,
        }],
        { session }
      );
    }

    // Remove only selected items from cart
    cart.items = cart.items.filter(
      item => !selectedProductIds.includes(item.productId.toString())
    );
    await cart.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json(
      new ApiResponse(
        201,
        order[0],
        "Order placed successfully. Awaiting payment."
      )
    );

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});
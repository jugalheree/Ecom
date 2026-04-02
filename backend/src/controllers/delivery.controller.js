import { Order } from "../models/order/Order.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";

// Delivery staff sees all active (non-cancelled, non-delivered) orders
export const getDeliveryOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const filter = {
    orderStatus: {
      $nin: ["PENDING_PAYMENT", "CANCELLED", "REFUNDED"],
    },
  };
  if (status) filter.orderStatus = status;

  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit))
    .populate({ path: "buyerId", select: "name phone" })
    .populate({ path: "items.productId", select: "title" })
    .lean();

  const total = await Order.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(200, {
      orders,
      pagination: { total, currentPage: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) },
    }, "Delivery orders fetched")
  );
});

// Update order delivery status
export const updateDeliveryStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status, note } = req.body;

  const ALLOWED = ["PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED_DELIVERY"];
  if (!ALLOWED.includes(status)) throw new ApiError(400, "Invalid delivery status");

  if (!mongoose.Types.ObjectId.isValid(orderId)) throw new ApiError(400, "Invalid order ID");

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");

  const statusToOrderStatus = {
    PICKED_UP: "PICKED_UP",
    OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
    DELIVERED: "DELIVERED",
  };

  if (statusToOrderStatus[status]) {
    order.orderStatus = statusToOrderStatus[status];
  }

  order.deliveryTracking.push({
    status,
    message: note || `Order ${status.replace(/_/g, " ").toLowerCase()}`,
    timestamp: new Date(),
  });

  if (status === "DELIVERED") {
    order.items.forEach((item) => {
      if (item.status !== "CANCELLED") item.status = "DELIVERED";
      item.deliveredAt = new Date();
    });
  }

  await order.save();

  return res.status(200).json(new ApiResponse(200, { orderStatus: order.orderStatus }, "Status updated"));
});

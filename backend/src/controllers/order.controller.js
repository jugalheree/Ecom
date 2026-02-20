import { Order } from "../models/order/Order.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getVendorOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    vendorId: req.user._id,
  })
    .populate("buyerId", "name")
    .sort({ createdAt: -1 });

  const mapped = orders.map((o) => ({
    id: o._id,
    buyer: o.buyerId?.name,
    total: o.totalAmount,
    status: o.status,
    items: o.items,
    date: o.createdAt,
  }));

  res.status(200).json(
    new ApiResponse(200, { orders: mapped }, "Orders fetched")
  );
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const order = await Order.findOne({
    _id: req.params.id,
    vendorId: req.user._id,
  });

  if (!order) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Order not found"));
  }

  order.status = status;
  await order.save();

  res.status(200).json(
    new ApiResponse(200, { status }, "Status updated")
  );
});

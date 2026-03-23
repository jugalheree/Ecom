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
import  uploadOnCloudinary  from "../utils/cloudinary.js";

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

    return res
      .status(201)
      .json(
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

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Dummy payment successful"));
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

    {
      $project: {
        orderNumber: 1,
        orderStatus: 1,
        paymentStatus: 1,
        createdAt: 1,
        totalAmount: 1,
        items: 1,
        productDetails: 1,
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
  const { productId } = req.body;
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
    throw new ApiError(403, "You cannot ship this product");
  }

  const item = order.items.find(
    (i) =>
      i.productId.toString() === productId &&
      i.vendorId.toString() === vendor._id.toString()
  );

  if (item.status === "SHIPPED") {
    throw new ApiError(400, "Item already shipped");
  }

  if (order.orderStatus === "CANCELLED") {
    throw new ApiError(400, "Order is cancelled");
  }

  item.status = "SHIPPED";
  item.shippedAt = new Date();

  const allShipped = order.items.every((i) => i.status === "SHIPPED");

  if (allShipped) {
    order.orderStatus = "SHIPPED";
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

  if (item.status !== "SHIPPED") {
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

  const order = await Order.findOne({
    _id: orderId,
    buyerId: userId,
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (["CANCELLED", "DELIVERED", "COMPLETED"].includes(order.orderStatus)) {
    throw new ApiError(400, "Order cannot be cancelled");
  }

  const shippedItem = order.items.some(
    (item) => item.status === "SHIPPED" || item.status === "DELIVERED"
  );

  if (shippedItem) {
    throw new ApiError(
      400,
      "Order cannot be cancelled because items are already shipped"
    );
  }

  // restore stock
  const bulkStockOps = order.items.map((item) => ({
    updateOne: {
      filter: { _id: item.productId },
      update: { $inc: { stock: item.quantity } },
    },
  }));

  await Product.bulkWrite(bulkStockOps);

  // cancel items
  order.items.forEach((item) => {
    item.status = "CANCELLED";
  });

  order.orderStatus = "CANCELLED";
  order.cancelledAt = new Date();

  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order cancelled successfully"));
});




// return request by buyer for product

export const requestReturn = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { productId, reason, description, images } = req.body;
  const buyerId = req.user._id;
  const quantity = Number(req.body.quantity);
  console.log(req.body);

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

  if (!mongoose.Types.ObjectId.isValid(returnId)) {
    throw new ApiError(400, "Invalid return id");
  }

  const returnRequest = await ReturnRequest.findById(returnId);

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

  // update order item
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
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      returnRequest,
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
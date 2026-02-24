import { Cart } from "../models/order/Cart.model.js";
import { Product } from "../models/product/Product.model.js";
import { Order } from "../models/order/Order.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const addToCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  if (!userId) {
    throw new ApiError(404, "User is not logged in.");
  }

  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    throw new ApiError(400, "Product and quantity required");
  }

  const product = await Product.findOne({
    _id: productId,
    approvalStatus: "APPROVED",
  });

  if (!product) {
    throw new ApiError(404, "Product not available");
  }

  if (product.stock < quantity) {
    throw new ApiError(400, "Insufficient stock");
  }

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = await Cart.create({
      userId,
      items: [],
    });
  }

  const existingItem = cart.items.find(
    (item) => item.productId.toString() === productId
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      productId,
      quantity,
      priceAtTime: product.price,
    });
  }

  await cart.save();

  return res.status(200).json(new ApiResponse(200, cart, "Added to cart"));
});




export const placeOrder = asyncHandler(async (req, res) => {
  const buyerId = req.user._id;

  const cart = await Cart.findOne({ userId: buyerId });

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  let totalAmount = 0;
  const orderItems = [];

  for (const item of cart.items) {
    const product = await Product.findOne({
      _id: item.productId,
      approvalStatus: "APPROVED",
      isActive: true,
    });

    if (!product) {
      throw new ApiError(400, "One of the products is unavailable");
    }

    if (product.stock < item.quantity) {
      throw new ApiError(
        400,
        `Insufficient stock for ${product.title}`
      );
    }

    totalAmount += product.price * item.quantity;

    orderItems.push({
      productId: product._id,
      vendorId: product.vendorId,
      quantity: item.quantity,
      priceAtPurchase: product.price,
    });
  }

  // Create return window (7 days example)
  const returnWindowEndsAt = new Date();
  returnWindowEndsAt.setDate(returnWindowEndsAt.getDate() + 7);

  const order = await Order.create({
    buyerId,
    items: orderItems,
    totalAmount,
    orderStatus: "PENDING_PAYMENT",
    paymentStatus: "PENDING",
    returnWindowEndsAt,
  });

  // Reduce stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: -item.quantity },
    });
  }

  // Clear cart
  await Cart.findOneAndDelete({ userId: buyerId });

  return res.status(201).json(
    new ApiResponse(
      201,
      order,
      "Order placed successfully. Awaiting payment."
    )
  );
});
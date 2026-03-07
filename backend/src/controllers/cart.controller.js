import { Cart } from "../models/order/Cart.model.js";
import { Product } from "../models/product/Product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from 'mongoose';

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




export const getCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const cart = await Cart.findOne({ userId })
    .populate({
      path: "items.productId",
      select: "title price stock approvalStatus isActive",
  });



  if (!cart) {
    return res.status(200).json(
      new ApiResponse(200, { items: [] }, "Cart is empty")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, cart, "Cart fetched successfully")
  );
});





// api for update item quantity
export const updateCartQuantity = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  let { productId, quantity } = req.body;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID");
  }

  quantity = Number(quantity);
  console.log("Quantity: ", quantity);

  if (isNaN(quantity) || quantity < 1) {
    throw new ApiError(400, "Invalid quantity");
  }

  const product = await Product.findOne({
    _id: productId,
    approvalStatus: "APPROVED",
    isActive: true
  }).select("stock minOrderQty saleType");

  if (!product) {
    throw new ApiError(404, "Product not available");
  }

  if (quantity > product.stock) {
    throw new ApiError(400, "Insufficient stock");
  }

  if (quantity < product.minOrderQty) {
    throw new ApiError(400, "Minimum order quantity not met");
  }

  const updatedCart = await Cart.findOneAndUpdate(
    { userId, "items.productId": productId },
    { $set: { "items.$.quantity": quantity } },
    { new: true }
  );

  if (!updatedCart) {
    throw new ApiError(404, "Item not found in cart");
  }

  return res.status(200).json(
    new ApiResponse(200, updatedCart, "Quantity updated successfully")
  );
});





export const removeFromCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product ID");
  }

  const updatedCart = await Cart.findOneAndUpdate(
    { userId, "items.productId": productId },
    { $pull: { items: { productId } } },
    { new: true }
  );

  if (!updatedCart) {
    throw new ApiError(404, "Item not found in cart");
  }

  if (updatedCart.items.length === 0) {
    await Cart.findOneAndDelete({ userId });
  }

  return res.status(200).json(
    new ApiResponse(200, updatedCart, "Item removed from cart")
  );
});
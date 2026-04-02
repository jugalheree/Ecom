import { Wishlist } from "../models/user/Wishlist.model.js";
import { Product } from "../models/product/Product.model.js";
import { ProductImage } from "../models/product/ProductImage.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

// GET /api/wishlist  — get current user's wishlist with full product details
export const getWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const wishlist = await Wishlist.findOne({ userId })
    .populate({
      path: "productIds",
      match: { isActive: true, approvalStatus: "APPROVED" },
      select: "title price stock vendorId approvalStatus vendorDiscountPercent festivalDiscountPercent bulkDiscountEnabled",
    })
    .lean();

  if (!wishlist || wishlist.productIds.length === 0) {
    return res.status(200).json(new ApiResponse(200, { items: [] }, "Wishlist is empty"));
  }

  // Filter out any null (deleted/inactive products)
  const validProducts = wishlist.productIds.filter(Boolean);

  // Attach primary image for each product
  const productIds = validProducts.map((p) => p._id);
  const images = await ProductImage.find({
    productId: { $in: productIds },
    isPrimary: true,
    isActive: true,
  }).select("productId imageUrl").lean();

  const imageMap = {};
  images.forEach((img) => { imageMap[img.productId.toString()] = img.imageUrl; });

  const enriched = validProducts.map((p) => ({
    ...p,
    imageUrl: imageMap[p._id.toString()] || null,
  }));

  return res.status(200).json(new ApiResponse(200, { items: enriched }, "Wishlist fetched"));
});


// POST /api/wishlist/toggle  — add if not present, remove if present
export const toggleWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.body;

  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Valid productId required");
  }

  // Verify product exists
  const product = await Product.findOne({ _id: productId, isActive: true }).lean();
  if (!product) throw new ApiError(404, "Product not found");

  let wishlist = await Wishlist.findOne({ userId });

  if (!wishlist) {
    wishlist = await Wishlist.create({ userId, productIds: [productId] });
    return res.status(200).json(new ApiResponse(200, { wishlisted: true }, "Added to wishlist"));
  }

  const already = wishlist.productIds.some((id) => id.toString() === productId.toString());

  if (already) {
    wishlist.productIds = wishlist.productIds.filter((id) => id.toString() !== productId.toString());
    await wishlist.save();
    return res.status(200).json(new ApiResponse(200, { wishlisted: false }, "Removed from wishlist"));
  } else {
    wishlist.productIds.push(productId);
    await wishlist.save();
    return res.status(200).json(new ApiResponse(200, { wishlisted: true }, "Added to wishlist"));
  }
});


// GET /api/wishlist/check/:productId  — check if a product is wishlisted
export const checkWishlisted = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid productId");
  }

  const wishlist = await Wishlist.findOne({ userId }).lean();
  const wishlisted = wishlist?.productIds?.some((id) => id.toString() === productId) ?? false;

  return res.status(200).json(new ApiResponse(200, { wishlisted }, "Wishlist status"));
});


// DELETE /api/wishlist/clear  — empty the wishlist
export const clearWishlist = asyncHandler(async (req, res) => {
  await Wishlist.findOneAndUpdate(
    { userId: req.user._id },
    { $set: { productIds: [] } }
  );
  return res.status(200).json(new ApiResponse(200, null, "Wishlist cleared"));
});

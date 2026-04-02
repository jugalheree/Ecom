import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Product } from "../models/product/Product.model.js";
import cloudinary from "../utils/cloudinary.js";

export const listProducts = asyncHandler(async (req, res) => {
  const { search, minPrice, maxPrice, minAi } = req.query;

  const filter = { isActive: true };

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (minAi) {
    filter.aiScore = { $gte: Number(minAi) };
  }

  const products = await Product.find(filter)
    .populate("vendorId", "name") // 🔥 THIS IS IMPORTANT
    .sort({ createdAt: -1 })
    .lean();

  const mapped = products.map((p) => ({
    id: p._id,
    name: p.name,
    price: p.price,
    ai: p.aiScore,
    description: p.description,
    vendorName: p.vendorId?.name || "Unknown Vendor", // 🔥 ADD THIS
    images: p.images,
  }));

  return res
    .status(200)
    .json(new ApiResponse(200, { products: mapped }, "Products fetched"));
});

export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id).lean();

  if (!product || !product.isActive) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Product not found"));
  }

  const mapped = {
    id: product._id,
    name: product.name,
    price: product.price,
    ai: product.aiScore,
    description: product.description,
  };

  return res.status(200).json(new ApiResponse(200, mapped, "Product fetched"));
});

export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, aiScore, stock } = req.body;

  if (!name || !price) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Name and price are required"));
  }

  let imageUrl = "";

  if (req.file) {
    const result = await cloudinary.uploader.upload_stream(
      { folder: "products" },
      async (error, result) => {
        if (error) throw error;
      }
    );
  }

  // Upload properly using buffer
  if (req.file) {
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "products" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    imageUrl = uploadResult.secure_url;
  }

  const product = await Product.create({
    name,
    description,
    price,
    aiScore: aiScore || 0,
    stock: stock || 0,
    isActive: true,
    vendorId: req.user._id,
    images: imageUrl ? [{ url: imageUrl }] : [],
  });

  return res
    .status(201)
    .json(new ApiResponse(201, product, "Product created successfully"));
});

export const listVendorProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({
    vendorId: req.user._id,
  }).sort({ createdAt: -1 });

  const mapped = products.map((p) => ({
    id: p._id,
    name: p.name,
    price: p.price,
    ai: p.aiScore,
    description: p.description,
    vendorName: p.vendorId?.name || "Unknown Vendor",
  }));

  return res
    .status(200)
    .json(
      new ApiResponse(200, { products: mapped }, "Vendor products fetched")
    );
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await Product.deleteOne({
    _id: req.params.id,
    vendorId: req.user._id,
  });

  res.status(200).json(new ApiResponse(200, null, "Product deleted"));
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { name, description, price, aiScore, stock } = req.body;

  const products = await Product.find(filter)
    .populate("vendorId", "name email") // 🔥 populate vendor
    .sort({ createdAt: -1 })
    .lean();

  if (!product) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Product not found"));
  }

  product.name = name ?? product.name;
  product.description = description ?? product.description;
  product.price = price ?? product.price;
  product.aiScore = aiScore ?? product.aiScore;
  product.stock = stock ?? product.stock;

  await product.save();

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product updated successfully"));
});

export const updateProductStock = asyncHandler(async (req, res) => {
  const { change } = req.body;

  if (typeof change !== "number") {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Stock change must be a number"));
  }

  const product = await Product.findOne({
    _id: req.params.id,
    vendorId: req.user._id,
  });

  if (!product) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Product not found"));
  }

  const newStock = product.stock + change;

  if (newStock < 0) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Stock cannot be negative"));
  }

  product.stock = newStock;
  await product.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, { stock: product.stock }, "Stock updated")
    );
});

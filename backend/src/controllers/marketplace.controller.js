import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Category } from "../models/product/Category.model.js";
import { Product } from "../models/product/Product.model.js";
import { ProductImage } from "../models/product/ProductImage.model.js";
import { Vendor } from "../models/vendor/Vendor.model.js";
import { ProductAttributeValue } from "../models/product/ProductAttributeValue.model.js";
import { CategoryAttribute } from "../models/product/CategoryAttribute.js";

// Get category tree
export const getCategoryTree = asyncHandler(async (req, res) => {
  // Fetch active categories
  const categories = await Category.find({ isActive: true })
    .select("name slug parentCategory level")
    .sort({ level: 1, name: 1 })
    .lean();

  // If DB somehow fails
  if (!categories) {
    throw new ApiError(500, "Failed to fetch categories");
  }

  // If no categories exist
  if (!categories.length) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No categories found"));
  }

  const categoryMap = {};
  const tree = [];

  // Create category map
  categories.forEach((cat) => {
    const id = cat._id.toString();

    categoryMap[id] = {
      _id: id,
      name: cat.name,
      slug: cat.slug,
      parentCategory: cat.parentCategory ? cat.parentCategory.toString() : null,
      level: cat.level,
      children: [],
      hasChildren: false,
    };
  });

  // Build tree structure
  categories.forEach((cat) => {
    const id = cat._id.toString();
    const parentId = cat.parentCategory ? cat.parentCategory.toString() : null;

    if (parentId && categoryMap[parentId]) {
      categoryMap[parentId].children.push(categoryMap[id]);
      categoryMap[parentId].hasChildren = true;
    } else {
      tree.push(categoryMap[id]);
    }
  });

  return res
    .status(200)
    .json(new ApiResponse(200, tree, "Category tree fetched successfully"));
});

// Helper function to get all child category IDs recursively
const getAllChildCategories = async (categoryId) => {
  const categories = await Category.find({ isActive: true })
    .select("_id parentCategory")
    .lean();

  const categoryMap = {};
  const childrenMap = {};

  categories.forEach((cat) => {
    categoryMap[cat._id.toString()] = cat;
  });

  categories.forEach((cat) => {
    const parent = cat.parentCategory?.toString();

    if (parent) {
      if (!childrenMap[parent]) {
        childrenMap[parent] = [];
      }

      childrenMap[parent].push(cat._id.toString());
    }
  });

  const result = [];
  const stack = [categoryId];

  while (stack.length) {
    const current = stack.pop();
    result.push(current);

    if (childrenMap[current]) {
      stack.push(...childrenMap[current]);
    }
  }

  return result;
};

// Get products by category with pagination and sorting
export const getProductsByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  let { page = 1, limit = 20, sort = "newest" } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new ApiError(400, "Invalid category id");
  }

  const category = await Category.findById(categoryId).lean();

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  const categoryIds = await getAllChildCategories(categoryId);

  let sortOption = {};

  switch (sort) {
    case "price_low_high":
      sortOption = { price: 1 };
      break;

    case "price_high_low":
      sortOption = { price: -1 };
      break;

    case "newest":
      sortOption = { createdAt: -1 };
      break;

    default:
      sortOption = { createdAt: -1 };
  }

  const query = {
    categoryId: { $in: categoryIds },
    isActive: true,
    approvalStatus: "APPROVED",
    stock: { $gt: 0 },
  };

  const totalProducts = await Product.countDocuments(query);

  const products = await Product.find(query)
    .sort(sortOption)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const productIds = products.map((p) => p._id);

  const images = await ProductImage.find({
    productId: { $in: productIds },
    isPrimary: true,
  }).lean();

  const imageMap = {};

  images.forEach((img) => {
    imageMap[img.productId.toString()] = img.imageUrl;
  });

  const result = products.map((product) => ({
    ...product,
    image: imageMap[product._id.toString()] || null,
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        products: result,
        pagination: {
          totalProducts,
          currentPage: page,
          totalPages: Math.ceil(totalProducts / limit),
          limit,
        },
      },
      "Products fetched successfully"
    )
  );
});

// filter options for category
export const getCategoryFilters = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw new ApiError(400, "Invalid category id");
  }

  const category = await Category.findById(categoryId).lean();

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  const categoryIds = await getAllChildCategories(categoryId);

  const attributes = await CategoryAttribute.find({
    categoryId: { $in: categoryIds },
    isFilterable: true,
    isActive: true,
  }).lean();

  const products = await Product.find({
    categoryId: { $in: categoryIds },
    isActive: true,
    approvalStatus: "APPROVED",
    stock: { $gt: 0 },
  })
    .select("_id price")
    .lean();

  const productIds = products.map((p) => p._id);

  const attributeValues = await ProductAttributeValue.find({
    productId: { $in: productIds },
    isActive: true,
  }).lean();

  const filtersMap = {};

  attributes.forEach((attr) => {
    filtersMap[attr.code] = {
      code: attr.code,
      label: attr.label,
      type: attr.dataType,
      options: new Set(),
    };
  });

  attributeValues.forEach((val) => {
    if (filtersMap[val.attributeCode]) {
      filtersMap[val.attributeCode].options.add(val.value);
    }
  });

  const filters = Object.values(filtersMap).map((filter) => ({
    code: filter.code,
    label: filter.label,
    type: filter.type,
    options: Array.from(filter.options),
  }));

  let minPrice = Infinity;
  let maxPrice = 0;

  products.forEach((p) => {
    if (p.price < minPrice) minPrice = p.price;
    if (p.price > maxPrice) maxPrice = p.price;
  });

  const priceRange = products.length ? { min: minPrice, max: maxPrice } : null;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        filters,
        priceRange,
      },
      "Category filters fetched successfully"
    )
  );
});

// Get product details
export const getProductDetails = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product id");
  }

  const product = await Product.findOne({
    _id: productId,
    isActive: true,
    approvalStatus: "APPROVED",
  }).lean();

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const images = await ProductImage.find({
    productId: product._id,
    isActive: true,
  })
    .sort({ order: 1 })
    .lean();

  const primaryImage = images.find((img) => img.isPrimary) || null;

  const vendor = await Vendor.findOne({
    _id: product.vendorId,
    isActive: true,
  })
    .select("shopName")
    .lean();

  const attributes = await ProductAttributeValue.find({
    productId: product._id,
  }).lean();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        product,
        primaryImage,
        images,
        attributes,
        vendor,
      },
      "Product details fetched successfully"
    )
  );
});

// similar or related products
export const getSimilarProducts = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product id");
  }

  const product = await Product.findOne({
    _id: productId,
    approvalStatus: "APPROVED",
    isActive: true,
  }).lean();

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const query = {
    categoryId: product.categoryId,
    _id: { $ne: product._id },
    approvalStatus: "APPROVED",
    isActive: true,
    stock: { $gt: 0 },
  };

  let similarProducts = await Product.find(query)
    .select("title price slug vendorId stock createdAt")
    .sort({ createdAt: -1 })
    .limit(12)
    .lean();

  if (!similarProducts.length) {
    similarProducts = await Product.aggregate([
      {
        $match: {
          _id: { $ne: mongoose.Types.ObjectId(productId) },
          approvalStatus: "APPROVED",
          isActive: true,
        },
      },
      { $sample: { size: 12 } },
    ]);
  }

  const productIds = similarProducts.map((p) => p._id);

  const images = await ProductImage.find({
    productId: { $in: productIds },
    isPrimary: true,
    isActive: true,
  }).lean();

  const imageMap = {};

  images.forEach((img) => {
    imageMap[img.productId.toString()] = img.imageUrl;
  });

  const result = similarProducts.map((p) => ({
    ...p,
    image: imageMap[p._id.toString()] || null,
  }));

  return res
    .status(200)
    .json(
      new ApiResponse(200, result, "Similar products fetched successfully")
    );
});

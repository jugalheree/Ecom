import { Category } from "../models/product/Category.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const createCategory = asyncHandler(async (req, res) => {
  const { name, parentCategory = null, isLeaf = false } = req.body;

  if (!name) {
    throw new ApiError(400, "Category name is required");
  }

  const slug = name.toLowerCase().replace(/\s+/g, "-");

  const existing = await Category.findOne({ slug });
  if (existing) {
    throw new ApiError(409, "Category already exists");
  }

  let level = 0;

  if (parentCategory) {
    const parent = await Category.findById(parentCategory);
    if (!parent) {
      throw new ApiError(404, "Parent category not found");
    }

    level = parent.level + 1;
  }

  const category = await Category.create({
    name,
    slug,
    parentCategory,
    level,
    isLeaf,
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      category,
      "Category created successfully"
    )
  );
});




export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).lean();

  return res.status(200).json(
    new ApiResponse(
      200,
      categories,
      "Categories fetched successfully"
    )
  );
});


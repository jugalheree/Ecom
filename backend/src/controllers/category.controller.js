import { Category } from "../models/product/Category.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { CategoryAttribute } from "../models/product/CategoryAttribute.js";

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

  return res
    .status(201)
    .json(new ApiResponse(201, category, "Category created successfully"));
});

export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).lean();

  return res
    .status(200)
    .json(new ApiResponse(200, categories, "Categories fetched successfully"));
});

// Attribute creation from admin side api
export const createCategoryAttribute = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  if (!categoryId) {
    throw new ApiError(400, "Category ID is required");
  }

  console.log("Body Content:", req.body); // Debugging log to check the request body

  const {
    code,
    label,
    dataType,
    options = [],
    unit,
    required = false,
    isFilterable = false,
    isComparable = false,
    aiWeight = 0,
  } = req.body;

  if (!code || !label || !dataType) {
    throw new ApiError(400, "Code, label and data type are required");
  }

  const allowedDataTypes = ["string", "number", "boolean", "enum"];
  if (!allowedDataTypes.includes(dataType)) {
    throw new ApiError(400, "Invalid data type");
  }

  if (dataType === "enum" && options.length === 0) {
    throw new ApiError(400, "Options are required for enum data type");
  }

  const category = await Category.findById(categoryId);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  if (!category.isLeaf) {
    throw new ApiError(400, "Attributes can only be added to leaf categories");
  }

  const existingAttribute = await CategoryAttribute.findOne({
    categoryId,
    code,
  });

  if (existingAttribute) {
    throw new ApiError(409, "Attribute code already exists for this category");
  }

  const attribute = await CategoryAttribute.create({
    categoryId,
    code,
    label,
    dataType,
    options,
    unit,
    required,
    isFilterable,
    isComparable,
    aiWeight,
  });

  if (!attribute) {
    throw new ApiError(500, "Failed to create category attribute");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, attribute, "Category attribute created successfully")
    );
});

export const getCategoryAttributes = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  if (!categoryId) {
    throw new ApiError(400, "Category ID is required");
  }

  const attributes = await CategoryAttribute.find({
    categoryId,
    isActive: true,
  }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        attributes,
        "Category attributes fetched successfully"
      )
    );
});

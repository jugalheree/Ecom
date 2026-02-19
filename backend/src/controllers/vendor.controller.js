import { Vendor } from "../models/vendor/Vendor.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/auth/User.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { VendorVerification } from "../models/vendor/VendorVerification.model.js";
import { Address } from "../models/user/Address.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Category } from "../models/product/Category.model.js";
import { Product } from "../models/product/Product.model.js";
import { CategoryAttribute } from "../models/product/CategoryAttribute.js";
import { ProductAttributeValue } from "../models/product/ProductAttributeValue.model.js";
import { ProductImage } from "../models/product/ProductImage.model.js";



// creating vender profile/ new vender registration
export const createVendorProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const {
    shopName,
    businessType,
    panNumber,
    gstNumber,
    freeDeliveryDistanceKm,
    deliveryChargePerKm,
  } = req.body;

  console.log(req.body);

  if (
    !shopName ||
    !businessType ||
    !panNumber ||
    !gstNumber ||
    !freeDeliveryDistanceKm ||
    !deliveryChargePerKm
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const vendorExists = await Vendor.findOne({
    userId,
    shopName,
  });

  if (vendorExists) {
    throw new ApiError(409, "Vendor with this shop name already exists");
  }

  const vendor = await Vendor.create({
    userId,
    shopName,
    businessType,
    panNumber,
    gstNumber,
    freeDeliveryDistanceKm,
    deliveryChargePerKm,
    isActive: false,
  });

  if (!vendor) {
    throw new ApiError(500, "Vendor creation failed");
  }

  await VendorVerification.create({
    vendorId: vendor._id,
    documents: [],
    status: "PENDING",
  });

  const user = await User.findById(userId);
  if (user) {
    user.role = "VENDOR";
    await user.save();
  }

  return res
    .status(201)
    .json(new ApiResponse(201, vendor, "Vendor created Successfully."));
});

export const attachAddressToVendor = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const { addressId } = req.body;
  const userId = req.user._id;

  console.log("vender id: ", vendorId);
  console.log("userId: ", userId);

  if (!addressId) {
    throw new ApiError(400, "Address ID is required");
  }

  // 1️⃣ Check vendor exists & belongs to user
  const vendor = await Vendor.findOne({ _id: vendorId, userId });
  if (!vendor) {
    throw new ApiError(404, "Vendor not found or unauthorized");
  }

  // 2️⃣ Check address exists & belongs to user
  const address = await Address.findOne({ _id: addressId, userId });
  if (!address) {
    throw new ApiError(404, "Address not found or unauthorized");
  }

  // 3️⃣ Attach address (no duplicates)
  await Vendor.findByIdAndUpdate(
    vendorId,
    { $addToSet: { businessAddresses: addressId } },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, null, "Address successfully attached to vendor")
    );
});

export const uploadVendorDocuments = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const files = req.files;

  if (!files || files.length === 0) {
    throw new ApiError(400, "No files uploaded");
  }

  if (files.length > 5) {
    throw new ApiError(400, "Maximum 5 documents allowed");
  }

  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
  files.forEach((file) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new ApiError(400, "Only image files are allowed");
    }
  });

  const vendor = await Vendor.findOne({ userId });

  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  const uploadUrls = await Promise.all(
    files.map(async (file) => {
      const uploadResult = await uploadOnCloudinary(file.path);
      if (!uploadResult || !uploadResult.secure_url) {
        throw new ApiError(500, "File upload failed");
      }
      return uploadResult.secure_url;
    })
  );

  if (uploadUrls.length === 0) {
    throw new ApiError(500, "No files were uploaded successfully");
  }

  const verification = await VendorVerification.findOneAndUpdate(
    { vendorId: vendor._id },
    {
      $push: { documents: { $each: uploadUrls } },
      status: "PENDING",
    },
    { new: true, upsert: true }
  );

  if (!verification) {
    throw new ApiError(500, "Vendor verification creation failed");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        verification,
        "Vendor documents uploaded successfully"
      )
    );
});

// product creation api
export const createProduct = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const {
    categoryId,
    title,
    description,
    price,
    stock,
    saleType,
    minDeliveryDays,
    maxDeliveryDays,
  } = req.body;

  if (
    !categoryId ||
    !title ||
    price === undefined ||
    stock === undefined ||
    !saleType ||
    !minDeliveryDays ||
    !maxDeliveryDays
  ) {
    throw new ApiError(400, "Required fields are missing");
  }

  const vendor = await Vendor.findOne({ userId, isActive: true });

  if (!vendor) {
    throw new ApiError(404, "Vendor profile not found");
  }

  if (vendor.isActive === false) {
    throw new ApiError(
      403,
      "Vendor profile is not active. Please complete verification."
    );
  }

  const category = await Category.findById(categoryId);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  if (!category.isLeaf) {
    throw new ApiError(400, "Products can only be added to leaf categories");
  }

  const slug = title.toLowerCase().replace(/[\s]+/g, "-") + "-" + Date.now();

  const product = await Product.create({
    vendorId: vendor._id,
    categoryId,
    title,
    slug,
    description,
    price,
    stock,
    saleType,
    minDeliveryDays,
    maxDeliveryDays,
    isApproved: false,
  });

  if (!product) {
    throw new ApiError(500, "Product creation failed");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, product, "Product created successfully"));
});

// add product attributes api
export const addProductAttributes = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { attributes } = req.body;

  if (!productId) {
    throw new ApiError(400, "Product ID is required");
  }

  if (!Array.isArray(attributes) || attributes.length === 0) {
    throw new ApiError(400, "Attributes are required and should be an array");
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Assuming attributes is an array of objects with name and value
  attributes.forEach((attr) => {
    if (!attr.code || attr.value === undefined) {
      throw new ApiError(400, "Each attribute must have code and value");
    }
  });

  const categoryAttributes = await CategoryAttribute.find({
    categoryId: product.categoryId,
    isActive: true,
  });

  if (categoryAttributes.length === 0) {
    throw new ApiError(
      400,
      "No attributes defined for this product's category"
    );
  }

  
  for (const def of categoryAttributes) {
  if (def.required) {
    const found = attributes.find(a => a.code === def.code);
    if (!found) {
      throw new ApiError(400, `Missing required attribute: ${def.code}`);
    }
  }
}

  const attributeMap = {};
  categoryAttributes.forEach((attr) => {
    attributeMap[attr.code] = attr;
  });

  for (const attr of attributes) {
    const definition = attributeMap[attr.code];

    if (!definition) {
      throw new ApiError(
        400,
        `Attribute code ${attr.code} is not defined for this category`
      );
    }

    if (
      definition.dataType === "enum" &&
      !definition.options.includes(attr.value)
    ) {
      throw new ApiError(
        400,
        `Invalid value for attribute ${attr.code}. Allowed values are: ${definition.options.join(", ")}`
      );
    }

    // If all validations pass, add attributes to product
    await ProductAttributeValue.create({
      productId,
      attributeCode: attr.code,
      value: attr.value,
      valueType: definition.dataType,
      numericValue:
        definition.dataType === "number" ? Number(attr.value) : undefined,
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Product attributes added successfully"));
});




export const uploadProductImages = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;

  const files = req.files;

  if (!files || files.length === 0) {
    throw new ApiError(400, "Please upload at least one image");
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const vendor = await Vendor.findOne({
    _id: product.vendorId,
    userId,
  });

  if (!vendor) {
    throw new ApiError(403, "Unauthorized access to product");
  }

  const uploadedImages = [];

  for (let i = 0; i < files.length; i++) {
    const uploadResult = await uploadOnCloudinary(
      files[i].path,
      "product-images"
    );

    const image = await ProductImage.create({
      productId,
      imageUrl: uploadResult.secure_url,
      isPrimary: i === 0, // first image primary
      order: i,
    });

    uploadedImages.push(image);
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      uploadedImages,
      "Product images uploaded successfully"
    )
  );
});
import { Vendor } from "../models/vendor/Vendor.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/auth/User.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { VendorVerification } from "../models/vendor/VendorVerification.model.js";
import { Address } from "../models/user/Address.model.js";
import  uploadOnCloudinary  from "../utils/cloudinary.js";
import { Category } from "../models/product/Category.model.js";
import { Product } from "../models/product/Product.model.js";
import { computeProductAIScore } from "../utils/aiScoring.js";
import { CategoryAttribute } from "../models/product/CategoryAttribute.js";
import { ProductAttributeValue } from "../models/product/ProductAttributeValue.model.js";
import { ProductImage } from "../models/product/ProductImage.model.js";
import mongoose from "mongoose";
import { Order } from "../models/order/Order.model.js";
import { VendorBankAccount } from "../models/vendor/VendorBankAccount.model.js";
import { TradeWallet } from "../models/finance/TradeWallet.model.js";
import { WalletTransaction } from "../models/finance/WalletTransaction.model.js";

// creating vendor profile / new vendor registration
export const createVendorProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const {
    vendorType,
    shopName,
    businessType,
    panNumber,
    gstNumber,          // optional for both
    orgOwnerName,       // required only for ORGANIZATION
    orgOwnerPhone,      // required only for ORGANIZATION
    freeDeliveryDistanceKm,
    deliveryChargePerKm,
    deliveryRadiusKm,
    shopLat,
    shopLng,
  } = req.body;

  if (!shopName || !businessType || !panNumber) {
    throw new ApiError(400, "Shop name, business type and PAN are required");
  }

  const type = vendorType || "SOLO";

  if (type === "ORGANIZATION") {
    if (!orgOwnerName || !orgOwnerPhone) {
      throw new ApiError(400, "Organization owner name and phone are required");
    }
  }

  const vendorExists = await Vendor.findOne({ userId, shopName });
  if (vendorExists) {
    throw new ApiError(409, "Vendor with this shop name already exists");
  }

  const vendor = await Vendor.create({
    userId,
    vendorType: type,
    shopName,
    businessType,
    panNumber,
    gstNumber: gstNumber || null,
    orgOwnerName: type === "ORGANIZATION" ? orgOwnerName : null,
    orgOwnerPhone: type === "ORGANIZATION" ? orgOwnerPhone : null,
    freeDeliveryDistanceKm: Number(freeDeliveryDistanceKm) || 0,
    deliveryChargePerKm: Number(deliveryChargePerKm) || 0,
    deliveryRadiusKm: Number(deliveryRadiusKm) || 10,
    shopLocation: {
      lat: shopLat ? Number(shopLat) : null,
      lng: shopLng ? Number(shopLng) : null,
    },
    isActive: false,
  });

  if (!vendor) throw new ApiError(500, "Vendor creation failed");

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
    // Product standards
    hasExpiry,
    manufacturingDate,
    expiryDate,
    clothingSizes,
    productStandards,
    productCategory,
    // Discount & alert
    vendorDiscountPercent = 0,
    minStockAlert = 5,
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

  // Validate expiry date
  if (hasExpiry && expiryDate) {
    const expDate = new Date(expiryDate);
    if (expDate <= new Date()) {
      throw new ApiError(400, "Expiry date must be in the future");
    }
  }

  // Validate clothing sizes
  const validSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "FREE SIZE",
    "28", "30", "32", "34", "36", "38", "40", "42", "44", "46"];
  let parsedClothingSizes = [];
  if (clothingSizes) {
    const sizesArr = Array.isArray(clothingSizes) ? clothingSizes : JSON.parse(clothingSizes);
    parsedClothingSizes = sizesArr.filter(s => validSizes.includes(s));
  }

  const slug = title.toLowerCase().replace(/[\s]+/g, "-") + "-" + Date.now();

  // ── Compute AI quality score (pure math, no API key) ──────────────────
  const aiScore = computeProductAIScore({
    title,
    description: description || "",
    productCategory: productCategory || "GENERAL",
  });

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
    hasExpiry: !!hasExpiry,
    manufacturingDate: manufacturingDate ? new Date(manufacturingDate) : null,
    expiryDate: hasExpiry && expiryDate ? new Date(expiryDate) : null,
    clothingSizes: parsedClothingSizes,
    productStandards: productStandards ? (typeof productStandards === "string" ? JSON.parse(productStandards) : productStandards) : {},
    productCategory: productCategory || "GENERAL",
    vendorDiscountPercent: Math.min(100, Math.max(0, Number(vendorDiscountPercent) || 0)),
    minStockAlert: Math.max(0, Number(minStockAlert) || 5),
    aiScore,
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






export const getProducts = asyncHandler(async (req, res) => {

  const userId = req.user._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const vendor = await Vendor.findOne({ userId });

  if (!vendor) {
    throw new ApiError(401, "No Vendor found for this user");
  }

  const products = await Product.aggregate([

    {
      $match: {
        vendorId: vendor._id
      }
    },

    {
      $lookup: {
        from: "productimages", // collection name in mongodb
        localField: "_id",
        foreignField: "productId",
        as: "images"
      }
    },

    {
      $addFields: {
        primaryImage: {
          $first: {
            $filter: {
              input: "$images",
              as: "img",
              cond: { $eq: ["$$img.isPrimary", true] }
            }
          }
        }
      }
    }

  ]);

  if (!products || products.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, products, "No product found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, products, "Products fetched successfully"));

});





// get vendor products with pagination, filtering and sorting
export const getVendorProducts = asyncHandler(async (req, res) => {

  // Lookup the Vendor profile — products are stored with vendorId = vendor._id (NOT user._id)
  const vendor = await Vendor.findOne({ userId: req.user._id }).lean();
  if (!vendor) throw new ApiError(404, "Vendor profile not found");
  const vendorId = vendor._id;

  let {
    page = 1,
    limit = 10,
    status,
    search,
    sort = "newest"
  } = req.query;

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  const filter = {
    vendorId,
    isActive: true
  };

  // Approval status filter
  if (status) {
    filter.approvalStatus = status;
  }

  // Search
  if (search) {
    filter.title = { $regex: new RegExp(search, "i") };
  }

  // Sorting
  let sortOption = {};
  switch (sort) {
    case "price_low_high":
      sortOption = { price: 1 };
      break;
    case "price_high_low":
      sortOption = { price: -1 };
      break;
    case "oldest":
      sortOption = { createdAt: 1 };
      break;
    default:
      sortOption = { createdAt: -1 };
  }

  const totalProducts = await Product.countDocuments(filter);

  const products = await Product.find(filter)
    .sort(sortOption)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const productIds = products.map(p => p._id);

  // Fetch primary images
  const images = await ProductImage.find({
    productId: { $in: productIds },
    isPrimary: true,
    isActive: true
  }).lean();

  const imageMap = {};
  images.forEach(img => {
    imageMap[img.productId.toString()] = img.imageUrl;
  });

  // 🔥 Product sales stats (advanced)
  const salesStats = await Order.aggregate([
    { $unwind: "$items" },
    {
      $match: {
        "items.productId": { $in: productIds }
      }
    },
    {
      $group: {
        _id: "$items.productId",
        totalSold: { $sum: "$items.quantity" },
        revenue: { $sum: "$items.price" }
      }
    }
  ]);

  const statsMap = {};
  salesStats.forEach(stat => {
    statsMap[stat._id.toString()] = stat;
  });

  const result = products.map(p => ({
    _id: p._id,
    title: p.title,
    price: p.price,
    stock: p.stock,
    approvalStatus: p.approvalStatus,
    image: imageMap[p._id.toString()] || null,

    // 🔥 extra insights
    totalSold: statsMap[p._id]?.totalSold || 0,
    revenue: statsMap[p._id]?.revenue || 0
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
          limit
        }
      },
      "Vendor products fetched successfully"
    )
  );

});








// update product details api
export const updateProduct = asyncHandler(async (req, res) => {

  const { productId } = req.params;
  const _vendorUser = await Vendor.findOne({ userId: req.user._id }).lean();
  if (!_vendorUser) throw new ApiError(404, "Vendor profile not found");
  const vendorId = _vendorUser._id;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product id");
  }

  const allowedFields = [
    "title",
    "description",
    "price",
    "stock",
    "minOrderQty",
    "maxOrderQty",
    "minDeliveryDays",
    "maxDeliveryDays"
  ];

  const updateData = {};

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "No valid fields provided for update");
  }

  // Validation
  if (updateData.price && updateData.price < 0) {
    throw new ApiError(400, "Price cannot be negative");
  }

  if (updateData.stock && updateData.stock < 0) {
    throw new ApiError(400, "Stock cannot be negative");
  }

  // Recompute AI score if title or description changed
  if (updateData.title || updateData.description) {
    const existing = await Product.findOne({ _id: productId, vendorId }).lean();
    if (existing) {
      const newAiScore = computeProductAIScore({
        title: updateData.title || existing.title,
        description: updateData.description || existing.description || "",
        productCategory: existing.productCategory || "GENERAL",
      });
      updateData.aiScore = newAiScore;
    }
  }

  const product = await Product.findOneAndUpdate(
    { _id: productId, vendorId },
    {
      $set: {
        ...updateData,
        approvalStatus: "PENDING",
        isApproved: false
      }
    },
    { new: true }
  );

  if (!product) {
    throw new ApiError(404, "Product not found or unauthorized");
  }

  return res.status(200).json(
    new ApiResponse(200, product, "Product updated, pending admin approval")
  );

});




//
export const updateProductPrice = asyncHandler(async (req, res) => {

  const { productId } = req.params;
  const { price } = req.body;
  const _vendorUser2 = await Vendor.findOne({ userId: req.user._id }).lean();
  if (!_vendorUser2) throw new ApiError(404, "Vendor profile not found");
  const vendorId = _vendorUser2._id;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product id");
  }

  if (price === undefined || price < 0) {
    throw new ApiError(400, "Valid price required");
  }

  const product = await Product.findOneAndUpdate(
    { _id: productId, vendorId },
    { $set: { price, approvalStatus: "PENDING", isApproved: false } },
    { new: true }
  );

  if (!product) {
    throw new ApiError(404, "Product not found or unauthorized");
  }

  return res.status(200).json(
    new ApiResponse(200, product, "Price updated, pending approval")
  );
});

// PATCH /api/vendor/products/:productId/discount — set vendor discount %
export const updateVendorDiscount = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { vendorDiscountPercent, bulkPricingTiers } = req.body;

  const vendor = await Vendor.findOne({ userId: req.user._id }).lean();
  if (!vendor) throw new ApiError(404, "Vendor profile not found");

  const updates = {};

  if (vendorDiscountPercent !== undefined) {
    const val = Number(vendorDiscountPercent);
    if (isNaN(val) || val < 0 || val > 100) throw new ApiError(400, "Discount must be 0–100%");
    updates.vendorDiscountPercent = val;
  }

  if (bulkPricingTiers !== undefined) {
    if (!Array.isArray(bulkPricingTiers)) throw new ApiError(400, "bulkPricingTiers must be an array");
    for (const tier of bulkPricingTiers) {
      if (!tier.minQty || !tier.discountPercent) throw new ApiError(400, "Each tier needs minQty and discountPercent");
    }
    updates.bulkDiscountEnabled = bulkPricingTiers.length > 0;
    updates.bulkPricingTiers = bulkPricingTiers;
  }

  const product = await Product.findOneAndUpdate(
    { _id: productId, vendorId: vendor._id },
    { $set: updates },
    { new: true }
  );
  if (!product) throw new ApiError(404, "Product not found or unauthorized");

  return res.status(200).json(new ApiResponse(200, product, "Discount updated"));
});




// delete product api
export const deleteProduct = asyncHandler(async (req, res) => {

  const { productId } = req.params;
  const _vendorUser3 = await Vendor.findOne({ userId: req.user._id }).lean();
  if (!_vendorUser3) throw new ApiError(404, "Vendor profile not found");
  const vendorId = _vendorUser3._id;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product id");
  }

  const product = await Product.findOneAndUpdate(
    { _id: productId, vendorId },
    { $set: { isActive: false } },
    { new: true }
  );

  if (!product) {
    throw new ApiError(404, "Product not found or unauthorized");
  }

  return res.status(200).json(
    new ApiResponse(200, null, "Product deleted successfully")
  );

});




// get product details api (for vender)

export const getVendorProductDetails = asyncHandler(async (req, res) => {

  const { productId } = req.params;
  const _vendorUser4 = await Vendor.findOne({ userId: req.user._id }).lean();
  if (!_vendorUser4) throw new ApiError(404, "Vendor profile not found");
  const vendorId = _vendorUser4._id;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product id");
  }

  // 🔥 Single query with ownership check
  const product = await Product.findOne({
    _id: productId,
    vendorId
  }).lean();

  if (!product) {
    throw new ApiError(404, "Product not found or unauthorized");
  }

  const [
    images,
    attributes,
    stats,
    recentOrders
  ] = await Promise.all([

    // 📸 Images
    ProductImage.find({
      productId,
      isActive: true
    })
      .sort({ order: 1 })
      .lean(),

    // 📊 Attributes
    ProductAttributeValue.find({
      productId,
      isActive: true
    }).lean(),

    // 📦 Stats
    Order.aggregate([
      { $unwind: "$items" },
      {
        $match: {
          "items.productId": new mongoose.Types.ObjectId(productId)
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSoldQty: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.price" }
        }
      }
    ]),

    // 🧾 Recent orders (very useful for vendor)
    Order.aggregate([
      { $unwind: "$items" },
      {
        $match: {
          "items.productId": new mongoose.Types.ObjectId(productId)
        }
      },
      {
        $project: {
          orderId: "$_id",
          quantity: "$items.quantity",
          price: "$items.price",
          orderStatus: 1,
          createdAt: 1
        }
      },
      { $sort: { createdAt: -1 } },
      { $limit: 5 }
    ])

  ]);

  const finalStats = stats[0] || {
    totalOrders: 0,
    totalSoldQty: 0,
    totalRevenue: 0
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        product: {
          ...product,
          isLowStock: product.stock < 5 // 🔥 important UX flag
        },

        media: {
          images
        },

        attributes,

        analytics: finalStats,

        recentOrders

      },
      "Vendor product details fetched successfully"
    )
  );

});

//
// ─── Update product stock ─────────────────────────────────────────────────────
export const updateProductStock = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.params;
  const { change } = req.body;

  if (change === undefined || typeof change !== "number") {
    throw new ApiError(400, "A numeric 'change' value is required (positive to add, negative to subtract)");
  }

  if (!mongoose.isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid product ID");
  }

  const vendor = await Vendor.findOne({ userId }).lean();
  if (!vendor) throw new ApiError(403, "Vendor profile not found");

  const product = await Product.findOne({ _id: productId, vendorId: vendor._id, isActive: true });
  if (!product) throw new ApiError(404, "Product not found or does not belong to this vendor");

  const newStock = (product.stock || 0) + change;
  if (newStock < 0) throw new ApiError(400, "Stock cannot go below zero");

  product.stock = newStock;
  await product.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { stock: product.stock }, "Stock updated successfully"));
});

// GET /api/vendor/products/low-stock  — returns products at or below their minStockAlert
export const getLowStockProducts = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user._id }).lean();
  if (!vendor) throw new ApiError(404, "Vendor profile not found");

  // Find all products where stock <= minStockAlert
  const lowStock = await Product.find({
    vendorId: vendor._id,
    isActive: true,
    $expr: { $lte: ["$stock", "$minStockAlert"] },
  })
    .select("_id title stock minStockAlert price")
    .lean();

  // Attach primary image for each low-stock product
  const ProductImage = mongoose.model("ProductImage");
  const ids = lowStock.map((p) => p._id);
  const images = await ProductImage.find({ productId: { $in: ids }, isPrimary: true, isActive: true })
    .select("productId imageUrl").lean();
  const imgMap = {};
  images.forEach((i) => { imgMap[i.productId.toString()] = i.imageUrl; });

  const enriched = lowStock.map((p) => ({
    ...p,
    imageUrl: imgMap[p._id.toString()] || null,
  }));

  return res.status(200).json(new ApiResponse(200, enriched, `${enriched.length} product(s) with low stock`));
});

// PATCH /api/vendor/products/:productId/min-stock  — set the alert threshold
export const updateMinStockAlert = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { minStockAlert } = req.body;

  const val = Number(minStockAlert);
  if (isNaN(val) || val < 0) throw new ApiError(400, "minStockAlert must be a non-negative number");

  const vendor = await Vendor.findOne({ userId: req.user._id }).lean();
  if (!vendor) throw new ApiError(404, "Vendor profile not found");

  const product = await Product.findOneAndUpdate(
    { _id: productId, vendorId: vendor._id },
    { $set: { minStockAlert: val } },
    { new: true }
  );
  if (!product) throw new ApiError(404, "Product not found");

  return res.status(200).json(new ApiResponse(200, { minStockAlert: product.minStockAlert }, "Stock alert threshold updated"));
});

// GET /api/vendor/me — Returns the current vendor's profile (vendorId, shopName, etc.)
export const getVendorProfile = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user._id })
    .select("_id shopName businessType vendorScore isActive createdAt")
    .lean();
  if (!vendor) throw new ApiError(404, "Vendor profile not found");

  // Also return verification status so frontend can show pending screen
  const verification = await VendorVerification.findOne({ vendorId: vendor._id })
    .select("status adminRemark")
    .lean();

  return res.status(200).json(new ApiResponse(200, {
    ...vendor,
    verificationStatus: verification?.status || "PENDING",
    adminRemark: verification?.adminRemark || null,
  }, "Vendor profile fetched"));
});

// ── Bank account & payouts ─────────────────────────────────────────────────
export const getBankAccount = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user._id }).lean();
  if (!vendor) throw new ApiError(404, "Vendor profile not found");
  const bank = await VendorBankAccount.findOne({ vendorId: vendor._id }).lean();
  return res.status(200).json(new ApiResponse(200, bank || null, "Bank account fetched"));
});

export const saveBankAccount = asyncHandler(async (req, res) => {
  const { bankName, accountHolderName, accountNumber, ifscCode } = req.body;
  if (!bankName || !accountHolderName || !accountNumber || !ifscCode)
    throw new ApiError(400, "All bank fields are required");
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode.toUpperCase()))
    throw new ApiError(400, "Invalid IFSC code format");

  const vendor = await Vendor.findOne({ userId: req.user._id }).lean();
  if (!vendor) throw new ApiError(404, "Vendor profile not found");

  const bank = await VendorBankAccount.findOneAndUpdate(
    { vendorId: vendor._id },
    { bankName, accountHolderName, accountNumber, ifscCode: ifscCode.toUpperCase(), isVerified: false },
    { upsert: true, new: true }
  );
  return res.status(200).json(new ApiResponse(200, bank, "Bank account saved"));
});

export const requestPayout = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  if (!amount || Number(amount) <= 0) throw new ApiError(400, "Valid amount required");

  const vendor = await Vendor.findOne({ userId: req.user._id }).lean();
  if (!vendor) throw new ApiError(404, "Vendor profile not found");

  const bank = await VendorBankAccount.findOne({ vendorId: vendor._id });
  if (!bank) throw new ApiError(400, "Please add a bank account before requesting a payout");

  // Check wallet balance
  const wallet = await TradeWallet.findOne({ userId: req.user._id });
  const available = wallet ? (wallet.balance - (wallet.lockedBalance || 0)) : 0;
  if (Number(amount) > available) throw new ApiError(400, `Insufficient balance. Available: ₹${available}`);

  // Deduct from wallet and log transaction
  wallet.balance -= Number(amount);
  await wallet.save();

  await WalletTransaction.create({
    userId: req.user._id,
    type: "WITHDRAWAL",
    amount: Number(amount),
    description: `Payout requested to ${bank.bankName} ····${bank.accountNumber?.slice(-4) || "****"}`,
    status: "PENDING",
  });

  return res.status(200).json(new ApiResponse(200, { amount: Number(amount) }, "Payout request submitted! Processing in 2-3 business days."));
});

export const getPayoutHistory = asyncHandler(async (req, res) => {
  const txns = await WalletTransaction.find({
    userId: req.user._id,
    type: "WITHDRAWAL",
  }).sort({ createdAt: -1 }).limit(20).lean();
  return res.status(200).json(new ApiResponse(200, txns, "Payout history fetched"));
});

// ── Vendor Delivery Staff Management ──────────────────────────────────────

import { VendorDeliveryStaff } from "../models/vendor/VendorDeliveryStaff.model.js";
import { DeliveryAssignment } from "../models/order/DeliveryAssignment.model.js";

export const getMyDeliveryStaff = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user._id });
  if (!vendor) throw new ApiError(404, "Vendor profile not found");

  const staff = await VendorDeliveryStaff.find({ vendorId: vendor._id })
    .sort({ createdAt: -1 })
    .lean();

  // Attach active delivery counts
  const activeOrders = await DeliveryAssignment.aggregate([
    { $match: { vendorId: vendor._id, status: { $in: ["ASSIGNED","ACCEPTED","PICKED_UP","OUT_FOR_DELIVERY"] } } },
    { $group: { _id: "$deliveryPersonId", count: { $sum: 1 } } },
  ]);
  const countMap = {};
  activeOrders.forEach(a => { if (a._id) countMap[a._id.toString()] = a.count; });

  const result = staff.map(s => ({ ...s, activeDeliveries: countMap[s._id.toString()] || 0 }));
  return res.status(200).json(new ApiResponse(200, result, "Delivery staff fetched"));
});

export const addDeliveryStaff = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user._id });
  if (!vendor) throw new ApiError(404, "Vendor profile not found");

  const { name, phone } = req.body;
  if (!name || !phone) throw new ApiError(400, "Name and phone are required");

  const existing = await VendorDeliveryStaff.findOne({ vendorId: vendor._id, phone });
  if (existing) throw new ApiError(409, "A staff member with this phone already exists");

  const staff = await VendorDeliveryStaff.create({ vendorId: vendor._id, name, phone });
  return res.status(201).json(new ApiResponse(201, staff, "Delivery staff added"));
});

export const updateDeliveryStaff = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user._id });
  if (!vendor) throw new ApiError(404, "Vendor profile not found");

  const { staffId } = req.params;
  const staff = await VendorDeliveryStaff.findOne({ _id: staffId, vendorId: vendor._id });
  if (!staff) throw new ApiError(404, "Staff member not found");

  const { name, phone, isActive } = req.body;
  if (name !== undefined) staff.name = name;
  if (phone !== undefined) staff.phone = phone;
  if (isActive !== undefined) staff.isActive = isActive;
  await staff.save();

  return res.status(200).json(new ApiResponse(200, staff, "Staff updated"));
});

export const deleteDeliveryStaff = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user._id });
  if (!vendor) throw new ApiError(404, "Vendor profile not found");

  const { staffId } = req.params;
  const staff = await VendorDeliveryStaff.findOne({ _id: staffId, vendorId: vendor._id });
  if (!staff) throw new ApiError(404, "Staff member not found");

  await VendorDeliveryStaff.findByIdAndDelete(staffId);
  return res.status(200).json(new ApiResponse(200, null, "Staff removed"));
});

export const assignDeliveryByVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user._id });
  if (!vendor) throw new ApiError(404, "Vendor profile not found");

  const { orderId, staffId } = req.body;
  if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(staffId))
    throw new ApiError(400, "Invalid order or staff ID");

  const [order, staff] = await Promise.all([
    Order.findById(orderId),
    VendorDeliveryStaff.findOne({ _id: staffId, vendorId: vendor._id, isActive: true }),
  ]);
  if (!order) throw new ApiError(404, "Order not found");
  if (!staff) throw new ApiError(404, "Delivery staff not found or inactive");

  // Re-assign if there's already a failed/reassigned entry; block if active
  const existing = await DeliveryAssignment.findOne({ orderId, status: { $nin: ["FAILED","REASSIGNED"] } });
  if (existing) {
    // Allow reassignment by marking old one as REASSIGNED
    existing.status = "REASSIGNED";
    await existing.save();
  }

  const assignment = await DeliveryAssignment.create({
    orderId,
    // Store VendorDeliveryStaff id — we also embed name/phone as snapshot so populate isn't needed
    deliveryPersonId: staff._id,
    vendorStaffSnapshot: { name: staff.name, phone: staff.phone },
    vendorId: vendor._id,
    status: "ASSIGNED",
    assignedBy: req.user._id,
  });

  // Increment active deliveries counter on staff
  await VendorDeliveryStaff.findByIdAndUpdate(staffId, { $inc: { activeDeliveries: 1 } });

  return res.status(201).json(new ApiResponse(201, assignment, "Order assigned to delivery staff"));
});

export const getVendorDeliveryAssignments = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user._id });
  if (!vendor) throw new ApiError(404, "Vendor profile not found");

  const assignments = await DeliveryAssignment.find({ vendorId: vendor._id })
    .populate("orderId", "orderNumber totalAmount orderStatus deliveryAddress")
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  // Hydrate deliveryPersonId with the embedded snapshot so the frontend always gets name/phone
  const hydrated = assignments.map((a) => ({
    ...a,
    deliveryPersonId: a.vendorStaffSnapshot
      ? { _id: a.deliveryPersonId, ...a.vendorStaffSnapshot }
      : a.deliveryPersonId,
  }));

  return res.status(200).json(new ApiResponse(200, hydrated, "Assignments fetched"));
});
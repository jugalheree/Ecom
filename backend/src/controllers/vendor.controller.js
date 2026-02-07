import { Vendor } from "../models/vendor/Vendor.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/auth/User.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { VendorVerification } from "../models/vendor/VendorVerification.model.js";
import { Address } from "../models/user/Address.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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
  files.forEach(file => {
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

import { Vendor } from "../models/vendor/Vendor.model.js";
import { User } from "../models/auth/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { VendorVerification } from "../models/vendor/VendorVerification.model.js";
import { Product } from "../models/product/Product.model.js";

// Get all vendor verification requests (Admin)
export const getPendingVendors = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const pendingVendors = await VendorVerification.aggregate([
    {
      $match: { status: "PENDING" },
    },

    {
      $lookup: {
        from: "vendors",
        localField: "vendorId",
        foreignField: "_id",
        as: "vendorDetails",
      },
    },

    { $unwind: "$vendorDetails" },

    {
      $lookup: {
        from: "users",
        localField: "vendorDetails.userId",
        foreignField: "_id",
        as: "userDetails",
      },
    },

    { $unwind: "$userDetails" },

    {
      $project: {
        _id: 1,
        name: "$userDetails.name",
        phone: "$userDetails.phone",
        email: "$userDetails.email",
        status: 1,
        createdAt: 1,
        updatedAt: 1,
        documents: 1,
        vendorId: 1,
        shopName: "$vendorDetails.shopName",
        businessType: "$vendorDetails.businessType",
        panNumber: "$vendorDetails.panNumber",
        gstNumber: "$vendorDetails.gstNumber",
      },
    },

    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        pendingVendors,
        "Pending vendor verifications fetched successfully"
      )
    );
});

// Approve Vendor Verification Request (Admin)
export const approveVendor = asyncHandler(async (req, res) => {
  // Get the vendorId first from params
  const { vendorId } = req.params;

  // find the vendor now from database by vendorId and status should be pending
  const vendor = await Vendor.findById(vendorId);

  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  const verification = await VendorVerification.findOne({ vendorId });

  if (!verification) {
    throw new ApiError(404, "Vendor verification record not found");
  }

  // Update the vendor verification status to approved
  await Vendor.findByIdAndUpdate(vendorId, {
    isActive: true,
  });

  await VendorVerification.findOneAndUpdate(
    { vendorId },
    {
      status: "VERIFIED",
      adminRemark: null,
      verifiedBy: req.user._id,
    }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, null, "Vendor verification approved successfully")
    );
});

// Reject Vendor Verification with remark
export const rejectVendor = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const { adminRemark } = req.body;
  console.log(adminRemark);

  //find the vendor first.
  const vendor = await Vendor.findById(vendorId);

  if (!vendor) {
    throw new ApiError(404, "Vendor not found");
  }

  const verification = await VendorVerification.findOne({ vendorId });

  if (!verification) {
    throw new ApiError(404, "Vendor verification record not found");
  }

  //Update the vendor verification status to rejected
  await VendorVerification.findOneAndUpdate(
    { vendorId },
    {
      status: "REJECTED",
      adminRemark: adminRemark,
      verifiedBy: req.user._id,
    }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, null, "Vendor verification rejected successfully")
    );
});

// Get all pending products for approval (Admin)
export const getPendingProducts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = { approvalStatus: "PENDING" };

  const total = await Product.countDocuments(filter);

  const products = await Product.find(filter)
    .populate("vendorId", "shopName")
    .populate("categoryId", "name")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        total,
        page,
        pages: Math.ceil(total / limit),
        products,
      },
      "Pending products fetched successfully"
    )
  );
});

// approving pending product
export const approvedProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!productId) {
    throw new ApiError(404, " product id is missing");
  }

  const product = Product.findById(productId);

  if (!product) {
    throw new ApiError(404,"Product not found");
  }

  await Product.findByIdAndUpdate(
    productId,
    {
      approvalStatus: "APPROVED",
      isApproved: true,
      adminRemark: null,
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Product approved successfully"));
});



// rejecting pending product 
export const rejectProduct = asyncHandler(async (req,res)=> {
  const { productId } = req.params;
  const { adminRemark } = req.body;

  if(!adminRemark){
    throw new ApiError(400,"Admin remark is required");
  }

  const product = await Product.findById(productId);

  if(!product){
    throw new ApiError(404,"Product is not found");
  }

  await Product.findByIdAndUpdate(
    productId,
    {
      approvalStatus: "REJECTED",
      isApproved: false,
      adminRemark: adminRemark,
    },
    { new: true }
  );

  return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          "Product rejected successfully"
        )
      );
});
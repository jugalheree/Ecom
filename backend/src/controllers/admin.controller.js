import { Vendor } from "../models/vendor/Vendor.model.js";
import { User } from "../models/auth/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { VendorVerification } from "../models/vendor/VendorVerification.model.js";
import { Product } from "../models/product/Product.model.js";
import { Order } from "../models/order/Order.model.js";
import mongoose from "mongoose";
import { Address } from "../models/user/Address.model.js";

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



// Get admin dashboard data
export const getAdminDashboard = asyncHandler(async (req, res) => {

  const { range = "month" } = req.query;

  const now = new Date();
  let startDate;

  // Dynamic date range
  if (range === "today") {
    startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
  } else if (range === "week") {
    startDate = new Date();
    startDate.setDate(now.getDate() - 7);
  } else {
    // default = month
    startDate = new Date();
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
  }

  const [
    totalUsers,
    totalVendors,
    approvedVendors,
    pendingVendors,
    totalOrders,
    periodOrders,
    revenueData,
    totalRevenueData,
    activeProducts,
    pendingProducts,
    recentOrders,
    orderStatusStats,
    topProducts
  ] = await Promise.all([

    User.countDocuments(),

    Vendor.countDocuments(),

    VendorVerification.countDocuments({ status: "VERIFIED" }),

    VendorVerification.countDocuments({ status: "PENDING" }),

    Order.countDocuments(),

    Order.countDocuments({
      createdAt: { $gte: startDate }
    }),

    // Revenue in selected range
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          paymentStatus: "SUCCESS"
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" }
        }
      }
    ]),

    // Total revenue
    Order.aggregate([
      {
        $match: { paymentStatus: "SUCCESS" }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" }
        }
      }
    ]),

    Product.countDocuments({
      isActive: true,
      approvalStatus: "APPROVED"
    }),

    Product.countDocuments({
      approvalStatus: "PENDING"
    }),

    Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("totalAmount orderStatus createdAt")
      .lean(),

    // Order status breakdown
    Order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 }
        }
      }
    ]),

    // Top selling products
    Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalSold: { $sum: "$items.quantity" }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ])

  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        overview: {
          totalUsers,
          totalVendors,
          approvedVendors,
          pendingVendors,
          totalOrders,
          activeProducts,
          pendingProducts
        },

        revenue: {
          current: revenueData[0]?.total || 0,
          total: totalRevenueData[0]?.total || 0
        },

        orders: {
          total: totalOrders,
          currentPeriod: periodOrders,
          statusBreakdown: orderStatusStats
        },

        topProducts,

        recentOrders

      },
      "Admin dashboard data fetched successfully"
    )
  );

});




// all user list with their roles
export const getAllUsers = asyncHandler(async (req, res) => {

  let { page = 1, limit = 10, role, search, sort = "newest" } = req.query;

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  const filter = {};

  if (role) {
    filter.role = role;
  }

  if (search) {
    const regex = new RegExp(search, "i");
    filter.$or = [
      { name: regex },
      { email: regex },
      { phone: regex }
    ];
  }

  // Sorting
  let sortOption = {};
  if (sort === "oldest") sortOption = { createdAt: 1 };
  else sortOption = { createdAt: -1 };

  const users = await User.find(filter)
    .select("-password -refreshToken")
    .sort(sortOption)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const userIds = users.map(u => u._id);

  const orderStats = await Order.aggregate([
    { $match: { buyerId: { $in: userIds } } },
    {
      $group: {
        _id: "$buyerId",
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: "$totalAmount" }
      }
    }
  ]);

  const statsMap = {};
  orderStats.forEach(stat => {
    statsMap[stat._id.toString()] = stat;
  });

  const result = users.map(user => ({
    ...user,
    totalOrders: statsMap[user._id]?.totalOrders || 0,
    totalSpent: statsMap[user._id]?.totalSpent || 0
  }));

  const totalUsers = await User.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users: result,
        pagination: {
          totalUsers,
          currentPage: page,
          totalPages: Math.ceil(totalUsers / limit),
          limit
        }
      },
      "Users fetched successfully"
    )
  );

});





// all details about user
export const getUserDetails = asyncHandler(async (req, res) => {

  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const user = await User.findById(userId)
    .select("-password -refreshToken")
    .lean();

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isVendor = user.role === "VENDOR";

  const [
    recentOrders,
    addresses,
    stats,
    vendorProducts,
    vendorOrderStats
  ] = await Promise.all([

    Order.find({ buyerId: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),

    Address.find({ userId }).lean(),

    Order.aggregate([
      { $match: { buyerId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" }
        }
      }
    ]),

    // Vendor Products
    isVendor
      ? Product.find({ vendorId: userId })
          .select("title price stock approvalStatus")
          .limit(10)
          .lean()
      : [],

    // Vendor Orders
    isVendor
      ? Order.aggregate([
          { $unwind: "$items" },
          {
            $match: {
              "items.vendorId": new mongoose.Types.ObjectId(userId)
            }
          },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalRevenue: { $sum: "$items.price" }
            }
          }
        ])
      : []

  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user,
        addresses,

        buyerData: {
          recentOrders,
          stats: stats[0] || { totalOrders: 0, totalSpent: 0 }
        },

        vendorData: isVendor
          ? {
              products: vendorProducts,
              stats: vendorOrderStats[0] || {
                totalOrders: 0,
                totalRevenue: 0
              }
            }
          : null
      },
      "User details fetched successfully"
    )
  );

});
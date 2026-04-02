import { PlatformConfig } from "../models/finance/PlatformConfig.model.js";
import { Product } from "../models/product/Product.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Helper — get or create the singleton config document
const getConfig = async () => {
  let config = await PlatformConfig.findOne({ singleton: "default" });
  if (!config) config = await PlatformConfig.create({ singleton: "default" });
  return config;
};

// GET /api/admin/platform-config  — get current config
export const getPlatformConfig = asyncHandler(async (req, res) => {
  const config = await getConfig();
  return res.status(200).json(new ApiResponse(200, config, "Platform config fetched"));
});

// PATCH /api/admin/platform-config/commission  — update commission %
export const updateCommission = asyncHandler(async (req, res) => {
  const { commissionPercent } = req.body;
  const val = Number(commissionPercent);

  if (isNaN(val) || val < 0 || val > 50) {
    throw new ApiError(400, "Commission must be between 0 and 50");
  }

  const config = await getConfig();
  config.commissionPercent = val;
  config.updatedBy = req.user._id;
  await config.save();

  return res.status(200).json(new ApiResponse(200, config, `Commission updated to ${val}%`));
});

// PATCH /api/admin/platform-config/festival  — set or clear festival discount
export const updateFestivalDiscount = asyncHandler(async (req, res) => {
  const { festivalDiscountPercent, festivalName, festivalEndsAt, festivalDiscountActive } = req.body;

  const config = await getConfig();

  if (typeof festivalDiscountPercent !== "undefined") {
    const val = Number(festivalDiscountPercent);
    if (isNaN(val) || val < 0 || val > 50) throw new ApiError(400, "Festival discount must be 0–50%");
    config.festivalDiscountPercent = val;
  }

  if (typeof festivalDiscountActive !== "undefined") {
    config.festivalDiscountActive = Boolean(festivalDiscountActive);
  }

  if (festivalName !== undefined)  config.festivalName = festivalName;
  if (festivalEndsAt !== undefined) config.festivalEndsAt = festivalEndsAt ? new Date(festivalEndsAt) : null;
  config.updatedBy = req.user._id;

  await config.save();

  // Propagate festival discount to all active products
  if (config.festivalDiscountActive) {
    await Product.updateMany(
      { approvalStatus: "APPROVED", isActive: true },
      { $set: { festivalDiscountPercent: config.festivalDiscountPercent } }
    );
  } else {
    // Clear festival discount from all products when turned off
    await Product.updateMany({}, { $set: { festivalDiscountPercent: 0 } });
  }

  return res.status(200).json(new ApiResponse(200, config,
    config.festivalDiscountActive
      ? `Festival discount of ${config.festivalDiscountPercent}% activated`
      : "Festival discount deactivated"
  ));
});

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Vendor } from "../models/vendor/Vendor.model.js";

export const isVendorApproved = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "VENDOR") {
    throw new ApiError(403, "Access denied. Vendor only route.");
  }

  const vendor = await Vendor.findOne({ userId: req.user._id });

  if (!vendor) {
    throw new ApiError(403, "Vendor profile not found");
  }

  if (vendor.status !== "APPROVED") {
    throw new ApiError(
      403,
      "Vendor not approved by admin yet"
    );
  }

  if (!vendor.isActive) {
    throw new ApiError(
      403,
      "Vendor account is inactive"
    );
  }

  req.vendor = vendor; // attach vendor to request
  next();
});
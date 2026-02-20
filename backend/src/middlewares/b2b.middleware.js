import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const requireB2BUser = asyncHandler(async (req, res, next) => {
  if (!req.user.isB2B) {
    throw new ApiError(
      403,
      "This operation is allowed only for B2B users"
    );
  }
  next();
});
// middlewares/auth.middleware.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/auth/User.model.js";

// Middleware to verify JWT and protect routes
export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // Accept token from cookie OR Authorization header "Bearer <token>"
    let token = req.cookies?.accessToken;

    if (!token) {
      const authHeader = req.header("Authorization");
      if (authHeader && typeof authHeader === "string") {
        // remove "Bearer " prefix (case sensitive) and trim
        token = authHeader.replace(/^Bearer\s+/i, "").trim();
      }
    }

    if (!token) {
      throw new ApiError(
        401,
        "No token provided, please login first or Unauthorized request"
      );
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    if (!user.isActive || user.isBlocked) {
      throw new ApiError(403, "Account is blocked or inactive");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

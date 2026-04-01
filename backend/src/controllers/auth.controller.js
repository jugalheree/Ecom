import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/auth/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateTokensForUser } from "../utils/token.js";
import { sendPasswordResetEmail } from "../utils/email.js";

// ── Cookie options ────────────────────────────────────────────────────────
// secure: true in production (HTTPS only), false in development (HTTP OK)
const cookieOptions = {
  httpOnly: true,                                           // JS cannot read — prevents XSS
  secure: process.env.NODE_ENV === "production",            // HTTPS only in prod
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
};

// ── Register ──────────────────────────────────────────────────────────────
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role, isB2B } = req.body;

  if (!name || !password || !role) {
    throw new ApiError(400, "Name, password and role are required");
  }
  if (!email && !phone) {
    throw new ApiError(400, "Email or phone is required");
  }

  const existingUserQuery = [];
  if (email) existingUserQuery.push({ email: email.trim().toLowerCase() });
  if (phone) existingUserQuery.push({ phone });
  if (existingUserQuery.length > 0) {
    const existingUser = await User.findOne({ $or: existingUserQuery });
    if (existingUser) throw new ApiError(409, "User already exists");
  }

  const user = await User.create({
    name,
    email: email ? email.trim().toLowerCase() : undefined,
    phone,
    password,
    role,
    isB2B: role === "BUYER" ? isB2B : false,
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");
  if (!createdUser) throw new ApiError(500, "User registration failed");

  const { accessToken, refreshToken } = await generateTokensForUser(user._id);

  return res
    .status(201)
    .cookie("accessToken",  accessToken,  cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(201, { user: createdUser, accessToken, refreshToken }, "User registered successfully"));
});

// ── Login ─────────────────────────────────────────────────────────────────
export const loginUser = asyncHandler(async (req, res) => {
  const { email, phone, password } = req.body;

  if ((!email && !phone) || !password) {
    throw new ApiError(400, "Email/phone and password are required");
  }

  let user;
  if (email) {
    user = await User.findOne({ email: email.trim().toLowerCase() });
  } else {
    user = await User.findOne({ phone });
  }

  if (!user) throw new ApiError(401, "Invalid credentials");
  if (user.isBlocked) throw new ApiError(403, "Your account has been blocked");

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) throw new ApiError(401, "Invalid credentials");

  const { accessToken, refreshToken } = await generateTokensForUser(user._id);

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  return res
    .status(200)
    .cookie("accessToken",  accessToken,  cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, { user: loggedInUser, accessToken }, "Login successful"));
});

// ── Refresh Token ─────────────────────────────────────────────────────────
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!incomingRefreshToken) throw new ApiError(401, "Refresh token missing");

  let decoded;
  try {
    decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch {
    throw new ApiError(401, "Invalid refresh token");
  }

  const user = await User.findById(decoded._id);
  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Refresh token expired or invalid");
  }

  const newAccessToken  = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .cookie("accessToken",  newAccessToken,  cookieOptions)
    .cookie("refreshToken", newRefreshToken, cookieOptions)
    .json(new ApiResponse(200, { accessToken: newAccessToken }, "Access token refreshed"));
});

// ── Logout ────────────────────────────────────────────────────────────────
export const logoutUser = asyncHandler(async (req, res) => {
  if (req.user?._id) {
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
  }

  return res
    .status(200)
    .clearCookie("accessToken",  cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, null, "Logout successful"));
});

// ── Forgot Password ────────────────────────────────────────────────────────
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email is required");

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  // Always return success to prevent email enumeration
  if (!user) {
    return res.status(200).json(new ApiResponse(200, null, "If that email exists, a reset link has been sent"));
  }

  // Generate a secure random token
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  user.passwordResetToken = hashedToken;
  user.passwordResetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  await user.save({ validateBeforeSave: false });

  // Build reset URL for email (never send in API response)
  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

  // Send reset email
  await sendPasswordResetEmail(user.email, user.name, resetUrl);

  return res.status(200).json(new ApiResponse(200, null, "If that email exists, a reset link has been sent"));
});

// ── Reset Password ─────────────────────────────────────────────────────────
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, token, newPassword } = req.body;
  if (!email || !token || !newPassword) throw new ApiError(400, "Email, token and newPassword are required");
  if (newPassword.length < 6) throw new ApiError(400, "Password must be at least 6 characters");

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    email: email.toLowerCase().trim(),
    passwordResetToken: hashedToken,
    passwordResetExpiry: { $gt: new Date() },
  });

  if (!user) throw new ApiError(400, "Invalid or expired reset token");

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpiry = undefined;
  user.refreshToken = undefined;
  await user.save();

  return res.status(200).json(new ApiResponse(200, null, "Password reset successful. Please log in."));
});

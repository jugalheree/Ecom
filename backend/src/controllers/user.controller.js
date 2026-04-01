import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Address } from "../models/user/Address.model.js";
import { User } from "../models/auth/User.model.js";

export const createAddress = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const {
    addressType = "SHOP",
    buildingNameOrNumber,
    landmark,
    area,
    city,
    state,
    country,
    pincode,
    location,
  } = req.body;

  if (
    !buildingNameOrNumber ||
    !area ||
    !city ||
    !state ||
    !country ||
    !pincode
  ) {
    throw new ApiError(400, "All required fields must be provided");
  }

  const allowedTypes = ["HOME", "SHOP", "WAREHOUSE"];
  if (!allowedTypes.includes(addressType)) {
    throw new ApiError(400, "Invalid address type");
  }

  if (!/^[0-9]{6}$/.test(pincode)) {
    throw new ApiError(400, "Invalid pincode");
  }

  const existingAddress = await Address.findOne({
    userId,
    addressType,
    buildingNameOrNumber,
    area,
    city,
    state,
    pincode,
  });

  if (existingAddress) {
    throw new ApiError(409, "Address already exists");
  }

  const address = await Address.create({
    userId,
    addressType,
    buildingNameOrNumber,
    landmark,
    area,
    city,
    state,
    country,
    pincode,
    location: location ? { lat: location.lat, lng: location.lng } : undefined,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, address, "Address created successfully"));
});

export const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
  return res.status(200).json(new ApiResponse(200, addresses, "Addresses fetched"));
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const address = await Address.findOneAndDelete({ _id: id, userId: req.user._id });
  if (!address) throw new ApiError(404, "Address not found");
  return res.status(200).json(new ApiResponse(200, null, "Address deleted"));
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password -refreshToken -passwordResetToken -passwordResetExpiry").lean();
  if (!user) throw new ApiError(404, "User not found");
  return res.status(200).json(new ApiResponse(200, user, "Profile fetched"));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const updates = {};
  if (name?.trim()) updates.name = name.trim();
  if (phone?.trim()) {
    if (!/^\d{10}$/.test(phone.trim())) throw new ApiError(400, "Invalid phone number");
    updates.phone = phone.trim();
  }
  const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true })
    .select("-password -refreshToken -passwordResetToken -passwordResetExpiry").lean();
  return res.status(200).json(new ApiResponse(200, user, "Profile updated"));
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) throw new ApiError(400, "Both fields required");
  if (newPassword.length < 6) throw new ApiError(400, "New password must be at least 6 characters");
  const user = await User.findById(req.user._id);
  const match = await user.isPasswordCorrect(currentPassword);
  if (!match) throw new ApiError(401, "Current password is incorrect");
  user.password = newPassword;
  await user.save();
  return res.status(200).json(new ApiResponse(200, null, "Password changed successfully"));
});

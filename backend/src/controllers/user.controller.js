import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Address } from "../models/user/Address.model.js";

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

import jwt from "jsonwebtoken";
import { User } from "../models/auth/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateTokensForUser } from "../utils/token.js";


export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role, isB2B } = req.body;

  console.log(req.body);

  if (!name || !password || !role) {
    throw new ApiError(400, "Name, password and role are required");
  }

  if (!email && !phone) {
    throw new ApiError(400, "Email or phone is required");
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { phone }],
  });

  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }



  const user = await User.create({
    name,
    email,
    phone,
    password,
    role,
    isB2B: role === "BUYER" ? isB2B : false,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "User registration failed");
  }

  console.log("Registered user hashed password: ", createdUser.password); // should be undefined due to select

  // Generate tokens
  const { accessToken, refreshToken } = await generateTokensForUser(user._id);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "development", // true in production, false in local
    sameSite: "strict"
  };

  return res
    .status(201)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions) // ✅ added refresh token in cookie too
    .json(
      new ApiResponse(
        201,
        {
          user: createdUser,
          accessToken, // also returning in body for frontend apps (like React)
          refreshToken
        },
        "User registered successfully"
      )
    );
});





//login controller

export const loginUser = asyncHandler(async (req, res) => {
  const { email, phone, password } = req.body;


  if ((!email && !phone) || !password) {
    throw new ApiError(400, "Email/phone and password are required");
  }


  console.log("Login attempt with email:", email);


  let user;

  if (email) {
    user = await User.findOne({ email: email.trim().toLowerCase() });
  } else if (phone) {
    user = await User.findOne({ phone });
  }


  // const user = await User.findOne({
  //   $or: [{ email }, { phone }],
  // });

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (user.isBlocked) {
    throw new ApiError(403, "Your account is blocked");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  console.log("Password valid:", isPasswordValid, " password is : ", password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials and password");
  }

  // ✅ reuse common token logic
  const { accessToken, refreshToken } = await generateTokensForUser(user._id);

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken },
        "Login successful"
      )
    );
});



export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  let decoded;
  try {
    decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  } catch {
    throw new ApiError(401, "Invalid refresh token");
  }

  const user = await User.findById(decoded._id);

  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Refresh token expired or invalid");
  }

  const newAccessToken = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  res
    .status(200)
    .cookie("accessToken", newAccessToken, cookieOptions)
    .cookie("refreshToken", newRefreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { accessToken: newAccessToken },
        "Access token refreshed"
      )
    );
});




export const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (userId) {
    await User.findByIdAndUpdate(userId, {
      $unset: { refreshToken: 1 },
    });
  }

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, null, "Logout successful"));
});
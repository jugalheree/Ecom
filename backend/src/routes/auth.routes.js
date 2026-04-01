import { Router } from "express";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();


// Register (Buyer / Vendor / Employee)
router.route('/register').post(registerUser);

// Login
router.route('/login').post(loginUser);

// Refresh access token
router.route('/refresh-token').post(refreshAccessToken);

// Logout (protected)
router.route('/logout').post(verifyJWT, logoutUser);

// Forgot / Reset password (public)
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password').post(resetPassword);

export default router;
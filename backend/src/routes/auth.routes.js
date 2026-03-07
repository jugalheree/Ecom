import { Router } from "express";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
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

export default router;
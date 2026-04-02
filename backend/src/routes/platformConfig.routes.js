import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import {
  getPlatformConfig,
  updateCommission,
  updateFestivalDiscount,
} from "../controllers/platformConfig.controller.js";

const router = Router();

// Public read — marketplace needs commission % to show to vendors
router.route("/config").get(getPlatformConfig);

// Admin-only writes
router.route("/config/commission").patch(verifyJWT, authorizeRoles("ADMIN"), updateCommission);
router.route("/config/festival").patch(verifyJWT, authorizeRoles("ADMIN"), updateFestivalDiscount);

export default router;

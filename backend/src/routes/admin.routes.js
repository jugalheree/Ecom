import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import {
  getUsers,
  getVendors,
  getAnalytics,
  getOrders,
  getClaims,
  approveClaim,
  rejectClaim,
} from "../controllers/admin.controller.js";

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles("ADMIN"));

router.get("/users", getUsers);
router.get("/vendors", getVendors);
router.get("/analytics", getAnalytics);
router.get("/orders", getOrders);
router.get("/claims", getClaims);
router.post("/claims/:claimId/approve", approveClaim);
router.post("/claims/:claimId/reject", rejectClaim);

export default router;

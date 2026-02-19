import { Router } from "express";
import {
  getVendorOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/vendor", verifyJWT, getVendorOrders);
router.patch("/:id/status", verifyJWT, updateOrderStatus);

export default router;

import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import { createCoupon, listCoupons, toggleCoupon, deleteCoupon, validateCoupon } from "../controllers/coupon.controller.js";

const router = Router();

// Public — validate a coupon code (buyer applies at checkout)
router.post("/validate", verifyJWT, validateCoupon);

// Admin only — manage coupons
router.use(verifyJWT, authorizeRoles("ADMIN"));
router.get("/",            listCoupons);
router.post("/",           createCoupon);
router.patch("/:id/toggle", toggleCoupon);
router.delete("/:id",      deleteCoupon);

export default router;

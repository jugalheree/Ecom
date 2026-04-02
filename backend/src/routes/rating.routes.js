import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { submitRating, getProductRatings, getVendorRatings, getMyRatings } from "../controllers/rating.controller.js";

const router = Router();

router.route("/product/:productId").get(getProductRatings);
router.route("/vendor/:vendorId").get(getVendorRatings);
router.use(verifyJWT);
router.route("/").post(submitRating);
router.route("/my").get(getMyRatings);

export default router;

import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import { getWishlist, toggleWishlist, checkWishlisted, clearWishlist } from "../controllers/wishlist.controller.js";

const router = Router();

// All wishlist routes require authentication and BUYER role
router.use(verifyJWT, authorizeRoles("BUYER"));

router.route("/").get(getWishlist);
router.route("/toggle").post(toggleWishlist);
router.route("/check/:productId").get(checkWishlisted);
router.route("/clear").delete(clearWishlist);

export default router;

import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import { getCategoryTree, getProductDetails, getProductsByCategory } from "../controllers/marketplace.controller.js";

const router = Router();

// Get pending vendors (protected only for admins)
router.route("/categories/tree").get(getCategoryTree);
router.route("/categories/:categoryId/products").get(getProductsByCategory);
router.route("/products/:productId").get(getProductDetails);

export default router;
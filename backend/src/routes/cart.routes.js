import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import { addToCart, getCart, removeFromCart, updateCartQuantity } from "../controllers/cart.controller.js";

const router = Router();

// FIX: Cart operations restricted to BUYER role only
router.route('/').get(verifyJWT, authorizeRoles("BUYER"), getCart);
router.route('/add').post(verifyJWT, authorizeRoles("BUYER"), addToCart);
router.route('/update').patch(verifyJWT, authorizeRoles("BUYER"), updateCartQuantity);
router.route('/:productId').delete(verifyJWT, authorizeRoles("BUYER"), removeFromCart);

export default router;

import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import { addToCart, getCart, removeFromCart, updateCartQuantity } from "../controllers/cart.controller.js";

const router = Router();

router.route('/').get(verifyJWT, getCart);
router.route('/add').post(verifyJWT, addToCart);
router.route('/update').patch(verifyJWT, updateCartQuantity);
router.route('/:productId').delete(verifyJWT, removeFromCart);


export default router;
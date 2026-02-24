import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import { placeOrder } from "../controllers/cart.controller.js";

const router = Router();

router.route('/place').post(verifyJWT, placeOrder);

export default router;

import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import { dummyPayOrder, getMyOrders, getOrderDetails, placeOrder } from "../controllers/order.controller.js";

const router = Router();

router.route('/place').post(verifyJWT, placeOrder);
router.route("/place/:orderId/pay").post(verifyJWT, dummyPayOrder);
router.route("/my-orders").get(verifyJWT, getMyOrders);
router.route("/my-orders/:orderId").get(verifyJWT, getOrderDetails);

export default router;
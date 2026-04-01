import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import { cancelOrder, confirmDelivery, walletPayOrder, getMyOrders, getOrderDetails, getOrderTimeline, placeOrder, requestReturn } from "../controllers/order.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// FIX: All buyer order routes now explicitly restrict to BUYER role
router.route('/place').post(verifyJWT, authorizeRoles("BUYER"), placeOrder);
router.route("/place/:orderId/pay").post(verifyJWT, authorizeRoles("BUYER"), walletPayOrder);
router.route("/my-orders").get(verifyJWT, authorizeRoles("BUYER"), getMyOrders);
router.route("/my-orders/:orderId").get(verifyJWT, authorizeRoles("BUYER"), getOrderDetails);
router.route("/my-orders/:orderId/confirm-delivery").patch(verifyJWT, authorizeRoles("BUYER"), confirmDelivery);
router.route("/my-orders/:orderId/cancel").patch(verifyJWT, authorizeRoles("BUYER"), cancelOrder);
router.route("/my-orders/:orderId/return").post(verifyJWT, authorizeRoles("BUYER"), upload.array('images', 10), requestReturn);
router.route("/my-orders/:orderId/timeline").get(verifyJWT, authorizeRoles("BUYER"), getOrderTimeline);

export default router;
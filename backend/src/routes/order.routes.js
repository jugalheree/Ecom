import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import { cancelOrder, confirmDelivery, dummyPayOrder, getMyOrders, getOrderDetails, getOrderTimeline, placeOrder, requestReturn } from "../controllers/order.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route('/place').post(verifyJWT, placeOrder);
router.route("/place/:orderId/pay").post(verifyJWT, dummyPayOrder);
router.route("/my-orders").get(verifyJWT, getMyOrders);
router.route("/my-orders/:orderId").get(verifyJWT, getOrderDetails);
router.route("/my-orders/:orderId/confirm-delivery").patch(verifyJWT, confirmDelivery);
router.route("/my-orders/:orderId/cancel").patch(verifyJWT, cancelOrder);
router.route("/my-orders/:orderId/return").post(verifyJWT, upload.array('images',10),requestReturn);
router.route("/my-orders/:orderId/timeline").get(verifyJWT, getOrderTimeline)

export default router;
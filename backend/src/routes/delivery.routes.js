import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import { getDeliveryOrders, updateDeliveryStatus } from "../controllers/delivery.controller.js";

const router = Router();

router.use(verifyJWT, authorizeRoles("EMPLOYEE"));

router.route("/orders").get(getDeliveryOrders);
router.route("/orders/:orderId/status").patch(updateDeliveryStatus);

export default router;

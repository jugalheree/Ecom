import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import {
  getAssignedDeliveries,
  updateStatus,
  markDelivered,
  uploadProof,
} from "../controllers/delivery.controller.js";

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles("DELIVERY"));

router.get("/deliveries", getAssignedDeliveries);
router.patch("/deliveries/:assignmentId/status", updateStatus);
router.post("/deliveries/:assignmentId/delivered", markDelivered);
router.post("/deliveries/:assignmentId/proof", uploadProof);

export default router;

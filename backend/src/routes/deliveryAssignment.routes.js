import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import {
  getDeliveryStaff, assignDelivery, getMyAssignments,
  updateAssignmentStatus, getVendorDeliveryUpdates,
  getAllAssignments,
} from "../controllers/deliveryAssignment.controller.js";

const router = Router();
router.use(verifyJWT);

// Admin routes
router.route("/staff").get(authorizeRoles("ADMIN"), getDeliveryStaff);
router.route("/assign").post(authorizeRoles("ADMIN"), assignDelivery);
router.route("/all").get(authorizeRoles("ADMIN"), getAllAssignments);

// Delivery person routes
router.route("/my").get(authorizeRoles("EMPLOYEE"), getMyAssignments);
router.route("/:assignmentId/status").patch(authorizeRoles("EMPLOYEE"), updateAssignmentStatus);
router.route("/location").post(authorizeRoles("EMPLOYEE"), async (req, res) => {
  // Simple location log — stores lat/lng on the delivery person's latest assignment
  const { lat, lng } = req.body;
  if (!lat || !lng) return res.status(400).json({ message: "lat and lng required" });
  // In production: store in Redis or push to socket. For now just acknowledge.
  return res.status(200).json({ success: true, message: "Location received", lat, lng });
});

// Vendor routes
router.route("/vendor-updates").get(authorizeRoles("VENDOR"), getVendorDeliveryUpdates);

export default router;

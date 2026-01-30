import { Router } from "express";
import { approveVendor, getPendingVendors, rejectVendor } from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";

const router = Router();

// Get pending vendors (protected only for admins)
router.route("/vendors/pending").get(verifyJWT, authorizeRoles("ADMIN"), getPendingVendors);
router.route("/vendors/:vendorId/approve").patch(verifyJWT, authorizeRoles("ADMIN"), approveVendor);
router.route("/vendors/:vendorId/reject").patch(verifyJWT, authorizeRoles("ADMIN"), rejectVendor);

export default router;
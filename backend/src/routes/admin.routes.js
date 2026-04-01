import { Router } from "express";
import { approvedProduct, approveVendor, getAdminDashboard, getAllUsers, getAllOrders, getAllVendors, getPendingProducts, getPendingVendors, getUserDetails, rejectProduct, rejectVendor, toggleBlockUser, deleteUser, cleanupIncompleteVendors, getVendorDetails, getProductDetails } from "../controllers/admin.controller.js";
import { refundReturnRequest, getVendorReturns } from "../controllers/order.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";

const router = Router();

// Vendors
router.route("/vendors/pending").get(verifyJWT, authorizeRoles("ADMIN"), getPendingVendors);
router.route("/vendors").get(verifyJWT, authorizeRoles("ADMIN"), getAllVendors);
router.route("/vendors/:vendorId/approve").patch(verifyJWT, authorizeRoles("ADMIN"), approveVendor);
router.route("/vendors/:vendorId/reject").patch(verifyJWT, authorizeRoles("ADMIN"), rejectVendor);
router.route("/vendors/:vendorId").get(verifyJWT, authorizeRoles("ADMIN"), getVendorDetails);

// Products
router.route("/products/pending").get(verifyJWT, authorizeRoles("ADMIN"), getPendingProducts);
router.route("/products/:productId/approve").patch(verifyJWT, authorizeRoles("ADMIN"), approvedProduct);
router.route("/products/:productId/reject").patch(verifyJWT, authorizeRoles("ADMIN"), rejectProduct);
router.route("/products/:productId").get(verifyJWT, authorizeRoles("ADMIN"), getProductDetails);

// Orders
router.route("/orders").get(verifyJWT, authorizeRoles("ADMIN"), getAllOrders);

// Returns — admin processes refunds
router.route("/returns").get(verifyJWT, authorizeRoles("ADMIN"), getVendorReturns);
router.route("/returns/:returnId/refund").patch(verifyJWT, authorizeRoles("ADMIN"), refundReturnRequest);

// Dashboard
router.route("/dashboard").get(verifyJWT, authorizeRoles("ADMIN"), getAdminDashboard);

// Users
router.route("/users").get(verifyJWT, authorizeRoles("ADMIN"), getAllUsers);
router.route("/users/:userId").get(verifyJWT, authorizeRoles("ADMIN"), getUserDetails);
router.route("/users/:userId").delete(verifyJWT, authorizeRoles("ADMIN"), deleteUser);
router.route("/users/:userId/toggle-block").patch(verifyJWT, authorizeRoles("ADMIN"), toggleBlockUser);

// Cleanup
router.route("/cleanup/incomplete-vendors").get(verifyJWT, authorizeRoles("ADMIN"), cleanupIncompleteVendors);

export default router;
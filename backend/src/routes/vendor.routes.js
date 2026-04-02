//Vender.routes.js

import { Router } from "express";
import { addProductAttributes, attachAddressToVendor, createProduct, createVendorProfile, deleteProduct, getVendorProductDetails, getVendorProducts, getVendorProfile, updateProduct, updateProductPrice, updateProductStock, uploadProductImages, uploadVendorDocuments, getBankAccount, saveBankAccount, requestPayout, getPayoutHistory, getMyDeliveryStaff, addDeliveryStaff, updateDeliveryStaff, deleteDeliveryStaff, assignDeliveryByVendor, getVendorDeliveryAssignments } from "../controllers/vendor.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { isVendorApproved } from "../middlewares/vendor.middleware.js";
import { getVendorOrders, markReturnPickedUp, markReturnReceived, refundReturnRequest, reviewReturnRequest, shipOrderItem, getVendorReturns } from "../controllers/order.controller.js";

const router = Router();

// create vender profile (protected only for venders)
router.route('/me').get(verifyJWT, authorizeRoles("VENDOR"), getVendorProfile);
router.route('/create-profile').post(verifyJWT, authorizeRoles("BUYER", "VENDOR"), createVendorProfile);
router.route('/:vendorId/address').post(verifyJWT, authorizeRoles("VENDOR"), attachAddressToVendor);
router.route('/verification/documents').post(verifyJWT, authorizeRoles("VENDOR"), upload.array('documents',10),uploadVendorDocuments);
router.route('/products').post(verifyJWT, authorizeRoles("VENDOR"), isVendorApproved, createProduct);
router.route('/products/:productId/attributes').post(verifyJWT, authorizeRoles("VENDOR"), isVendorApproved, addProductAttributes);
router.route('/products/:productId/images').post(verifyJWT, authorizeRoles("VENDOR"), isVendorApproved, upload.array('images',5), uploadProductImages);
router.route('/orders').get(verifyJWT, authorizeRoles("VENDOR"), isVendorApproved, getVendorOrders);
router.route('/orders/returns').get(verifyJWT, authorizeRoles("VENDOR"), isVendorApproved, getVendorReturns);
router.route('/orders/:orderId/ship').patch(verifyJWT, authorizeRoles("VENDOR"), isVendorApproved, shipOrderItem);
router.route('/orders/returns/:returnId/review').patch(verifyJWT, authorizeRoles("VENDOR"), isVendorApproved, reviewReturnRequest);
router.route('/orders/returns/:returnId/pickup').patch(verifyJWT, authorizeRoles("VENDOR"), isVendorApproved, markReturnPickedUp);
router.route('/orders/returns/:returnId/receive').patch(verifyJWT, authorizeRoles("VENDOR"), isVendorApproved, markReturnReceived);
// Refund is admin-only — only admin should process refunds
router.route('/orders/returns/:returnId/refund').patch(verifyJWT, authorizeRoles("ADMIN"), refundReturnRequest);
router.route("/products/:productId/stock").patch(verifyJWT, authorizeRoles("VENDOR"), isVendorApproved, updateProductStock);
router.route("/products/:productId").patch(verifyJWT, authorizeRoles("VENDOR"), isVendorApproved, updateProduct);
router.route("/products/:productId/price").patch(verifyJWT, authorizeRoles("VENDOR"), isVendorApproved, updateProductPrice);
router.route("/products/:productId").delete(verifyJWT, authorizeRoles("VENDOR"), isVendorApproved, deleteProduct);
router.route("/products").get(verifyJWT, authorizeRoles("VENDOR"), getVendorProducts);
router.route("/products/:productId").get(verifyJWT, authorizeRoles("VENDOR"), getVendorProductDetails);

// Bank account & payouts
router.route("/bank-account").get(verifyJWT, authorizeRoles("VENDOR"), getBankAccount).post(verifyJWT, authorizeRoles("VENDOR"), saveBankAccount);
router.route("/payouts").post(verifyJWT, authorizeRoles("VENDOR"), isVendorApproved, requestPayout).get(verifyJWT, authorizeRoles("VENDOR"), getPayoutHistory);

// Delivery staff management (vendor-side)
router.route("/delivery-staff").get(verifyJWT, authorizeRoles("VENDOR"), isVendorApproved, getMyDeliveryStaff);
router.route("/delivery-staff").post(verifyJWT, authorizeRoles("VENDOR"), isVendorApproved, addDeliveryStaff);
router.route("/delivery-staff/:staffId").patch(verifyJWT, authorizeRoles("VENDOR"), isVendorApproved, updateDeliveryStaff);
router.route("/delivery-staff/:staffId").delete(verifyJWT, authorizeRoles("VENDOR"), isVendorApproved, deleteDeliveryStaff);

// Vendor-side delivery assignments
router.route("/delivery-assignments").get(verifyJWT, authorizeRoles("VENDOR"), isVendorApproved, getVendorDeliveryAssignments);
router.route("/delivery-assignments/assign").post(verifyJWT, authorizeRoles("VENDOR"), isVendorApproved, assignDeliveryByVendor);

export default router;
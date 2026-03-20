//Vender.routes.js

import { Router } from "express";
import { addProductAttributes, attachAddressToVendor, createProduct, createVendorProfile, deleteProduct, getVendorProductDetails, getVendorProducts, updateProduct, updateProductPrice, updateProductStock, uploadProductImages, uploadVendorDocuments } from "../controllers/vendor.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { isVendorApproved } from "../middlewares/vendor.middleware.js";
import { getVendorOrders, markReturnPickedUp, markReturnReceived, refundReturnRequest, reviewReturnRequest, shipOrderItem } from "../controllers/order.controller.js";

const router = Router();

// create vender profile (protected only for venders)
router.route('/create-profile').post(verifyJWT, authorizeRoles("BUYER", "VENDOR"), createVendorProfile);
router.route('/:vendorId/address').post(verifyJWT, authorizeRoles("VENDOR"), attachAddressToVendor);
router.route('/verification/documents').post(verifyJWT, authorizeRoles("VENDOR"), upload.array('documents',10),uploadVendorDocuments);
router.route('/products').post(verifyJWT, authorizeRoles("VENDOR"), isVendorApproved, createProduct);
router.route('/products/:productId/attributes').post(verifyJWT, isVendorApproved, addProductAttributes);
router.route('/products/:productId/images').post(verifyJWT, isVendorApproved, upload.array('images',5), uploadProductImages);
router.route('/orders').get(verifyJWT, authorizeRoles("VENDOR"), isVendorApproved, getVendorOrders);
router.route('/orders/:orderId/ship').patch(verifyJWT, authorizeRoles("VENDOR"), isVendorApproved, shipOrderItem);
router.route('/orders/returns/:returnId/review').patch(verifyJWT, authorizeRoles("VENDOR"), isVendorApproved, reviewReturnRequest);
router.route('/orders/returns/:returnId/pickup').patch(verifyJWT, markReturnPickedUp);
router.route('/orders/returns/:returnId/receive').patch(verifyJWT, markReturnReceived);
router.route('/orders/returns/:returnId/refund').patch(verifyJWT, refundReturnRequest); // this api router will be change in future
router.route("/products/:productId/stock").patch(verifyJWT, isVendorApproved, updateProductStock);
router.route("/products/:productId").patch(verifyJWT, isVendorApproved, updateProduct);
router.route("/products/:productId/price").patch(verifyJWT, isVendorApproved, updateProductPrice);
router.route("/products/:productId").delete(verifyJWT, isVendorApproved, deleteProduct);
router.route("/products").get(verifyJWT, getVendorProducts);
router.route("/products/:productId").get(verifyJWT, getVendorProductDetails);

export default router;
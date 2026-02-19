//Vender.routes.js

import { Router } from "express";
import { addProductAttributes, attachAddressToVendor, createProduct, createVendorProfile, uploadProductImages, uploadVendorDocuments } from "../controllers/vendor.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { isVendorApproved } from "../middlewares/vendor.middleware.js";

const router = Router();

// create vender profile (protected only for venders)
router.route('/create-profile').post(verifyJWT, authorizeRoles("BUYER", "VENDOR"), createVendorProfile);
router.route('/:vendorId/address').post(verifyJWT, authorizeRoles("VENDOR"), attachAddressToVendor);
router.route('/verification/documents').post(verifyJWT, authorizeRoles("VENDOR"), upload.array('documents',10),uploadVendorDocuments);
router.route('/products').post(verifyJWT, authorizeRoles("VENDOR"), isVendorApproved, createProduct);
router.route('/products/:productId/attributes').post(verifyJWT, isVendorApproved, addProductAttributes);
router.route('/products/:productId/images').post(verifyJWT, isVendorApproved, upload.array('images',5), uploadProductImages);
export default router;
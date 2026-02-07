//Vender.routes.js

import { Router } from "express";
import { attachAddressToVendor, createVendorProfile, uploadVendorDocuments } from "../controllers/vendor.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// create vender profile (protected only for venders)
router.route('/create-profile').post(verifyJWT, authorizeRoles("BUYER", "VENDOR"), createVendorProfile);
router.route('/:vendorId/address').post(verifyJWT, authorizeRoles("VENDOR"), attachAddressToVendor);
router.route('/verification/documents').post(verifyJWT, authorizeRoles("VENDOR"), upload.array('documents',10),uploadVendorDocuments);
export default router;
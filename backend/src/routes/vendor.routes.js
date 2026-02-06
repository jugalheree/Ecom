import { Router } from "express";
import { attachAddressToVendor, createVendorProfile, uploadVendorDocuments } from "../controllers/vendor.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import { createAddress } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// create vender profile (protected only for venders)
router.route('/create-profile').post(verifyJWT, authorizeRoles("BUYER", "VENDOR"), createVendorProfile);
router.route('/address').post(verifyJWT, authorizeRoles("BUYER","VENDOR"), createAddress);
router.route('/:vendorId/address').post(verifyJWT, attachAddressToVendor);
router.route('/verification/upload-documents').post(verifyJWT, authorizeRoles("VENDOR"), upload.array('documents',10),uploadVendorDocuments);
export default router;
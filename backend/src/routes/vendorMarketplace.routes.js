// vendorMarketplace.routes.js

import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import { isVendorApproved } from "../middlewares/vendor.middleware.js";
import {
  getMarketplaceListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getMyListings,
  contactListingVendor,
  getMarketplaceStats,
} from "../controllers/vendorMarketplace.controller.js";

const router = Router();

// ─── Public-ish (any authenticated vendor can browse) ────────────────────────
router
  .route("/listings")
  .get(verifyJWT, authorizeRoles("VENDOR"), getMarketplaceListings)
  .post(verifyJWT, authorizeRoles("VENDOR"), isVendorApproved, createListing);

router.route("/stats").get(verifyJWT, authorizeRoles("VENDOR"), getMarketplaceStats);

router.route("/my-listings").get(verifyJWT, authorizeRoles("VENDOR"), getMyListings);

router
  .route("/listings/:id")
  .get(verifyJWT, authorizeRoles("VENDOR"), getListingById)
  .patch(verifyJWT, authorizeRoles("VENDOR"), isVendorApproved, updateListing)
  .delete(verifyJWT, authorizeRoles("VENDOR"), isVendorApproved, deleteListing);

router
  .route("/listings/:id/contact")
  .post(verifyJWT, authorizeRoles("VENDOR"), contactListingVendor);

export default router;

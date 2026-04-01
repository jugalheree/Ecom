import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getAutocompleteSuggestions,
  geocodePlaceId,
  reverseGeocode,
  saveBuyerLocation,
  getNearbyProducts,
  getMyAddresses,
} from "../controllers/location.controller.js";

const router = Router();

// Public: Ola Maps proxy endpoints (no auth needed for search UX)
router.route("/autocomplete").get(getAutocompleteSuggestions);
router.route("/geocode").get(geocodePlaceId);
router.route("/reverse-geocode").get(reverseGeocode);

// Protected: Buyer location management
router.route("/my-addresses").get(verifyJWT, getMyAddresses);
router.route("/buyer/delivery-location").post(verifyJWT, saveBuyerLocation);

// Protected: Nearby products
router.route("/nearby-products").get(getNearbyProducts);

export default router;

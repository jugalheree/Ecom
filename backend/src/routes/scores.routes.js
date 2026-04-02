import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import {
  recomputeProductScore,
  recomputeBuyerScore,
  recomputeVendorScore,
} from "../controllers/scoreComputation.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { computeProductAIScoreDetailed, getTotalProductScore } from "../utils/aiScoring.js";
import { Product } from "../models/product/Product.model.js";

const router = Router();

// Admin-only — trigger manual recomputation of any score
router.route("/product/:productId").post(verifyJWT, authorizeRoles("ADMIN"), recomputeProductScore);
router.route("/buyer/:buyerId").post(verifyJWT, authorizeRoles("ADMIN"), recomputeBuyerScore);
router.route("/vendor/:vendorId").post(verifyJWT, authorizeRoles("ADMIN"), recomputeVendorScore);

// GET /api/scores/product/:productId — get current AI + rating breakdown for any product
router.route("/product/:productId/breakdown").get(verifyJWT, asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId).select("title description productCategory aiScore ratingScore").lean();
  if (!product) return res.status(404).json(new ApiResponse(404, null, "Product not found"));

  const { aiScore, breakdown, tips } = computeProductAIScoreDetailed({
    title:           product.title,
    description:     product.description || "",
    productCategory: product.productCategory || "GENERAL",
  });
  const totalScore = getTotalProductScore(aiScore, product.ratingScore || 0);

  return res.status(200).json(new ApiResponse(200, {
    aiScore,
    ratingScore: product.ratingScore || 0,
    totalScore,
    breakdown,
    tips,
  }, "Score breakdown"));
}));

// POST /api/scores/preview — preview AI score before product is saved
// Body: { title, description, productCategory }
router.route("/preview").post(asyncHandler(async (req, res) => {
  const { title = "", description = "", productCategory = "GENERAL" } = req.body;
  const result = computeProductAIScoreDetailed({ title, description, productCategory });
  return res.status(200).json(new ApiResponse(200, result, "Score preview"));
}));

export default router;

// category.routes.js
import { Router } from "express";
import { createCategory, getAllCategories, getCategoryAttributes, createCategoryAttribute } from "../controllers/category.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";

const router = Router();

// Admin routes (protected)
router.route("/create-category").post(verifyJWT, authorizeRoles("ADMIN"), createCategory);
router.route("/:categoryId/attributes").post(verifyJWT, authorizeRoles("ADMIN"), createCategoryAttribute);

// Public
router.route("/").get(getAllCategories);
router.route("/:categoryId/attributes").get(getCategoryAttributes);


export default router;
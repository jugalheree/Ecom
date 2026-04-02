import { Router } from "express";
import { listVendorProducts } from '../controllers/product.controller.js';
import { deleteProduct } from '../controllers/product.controller.js';
import { upload } from "../middlewares/upload.middleware.js";
import { updateProductStock } from '../controllers/product.controller.js';


import {
  listProducts,
  getProductById,
  updateProduct,
  createProduct
} from "../controllers/product.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", listProducts);
router.get("/:id", getProductById);
router.delete("/:id", verifyJWT, deleteProduct);
router.get("/vendor/my-products", verifyJWT, listVendorProducts);
router.put("/:id", verifyJWT, updateProduct);
router.patch("/:id/stock", verifyJWT, updateProductStock);



// Vendor only
router.post("/", verifyJWT, upload.single("image"), createProduct);

export default router;

import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import { createAddress } from "../controllers/user.controller.js";

const router = Router();

router.route('/address').post(verifyJWT, createAddress);

export default router;
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import { raiseDispute, getMyDisputes, getAllDisputes, resolveDispute } from "../controllers/dispute.controller.js";

const router = Router();

router.use(verifyJWT);
router.route("/").post(raiseDispute);
router.route("/my").get(getMyDisputes);
router.route("/admin").get(authorizeRoles("ADMIN"), getAllDisputes);
router.route("/admin/:id/resolve").patch(authorizeRoles("ADMIN"), resolveDispute);

export default router;

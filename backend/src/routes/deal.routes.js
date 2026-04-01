import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import {
  proposeDeal, getMyDeals, getDealById,
  respondToDeal, signDeal, completeDeal,
  breakDeal, sendDealMessage,
} from "../controllers/deal.controller.js";

const router = Router();
router.use(verifyJWT, authorizeRoles("VENDOR"));

router.route("/").post(proposeDeal);
router.route("/my").get(getMyDeals);
router.route("/:dealId").get(getDealById);
router.route("/:dealId/respond").patch(respondToDeal);
router.route("/:dealId/sign").patch(signDeal);
router.route("/:dealId/complete").patch(completeDeal);
router.route("/:dealId/break").patch(breakDeal);
router.route("/:dealId/message").post(sendDealMessage);

export default router;

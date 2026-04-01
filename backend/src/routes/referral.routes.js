import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getMyReferralCode, applyReferralCode, getReferralHistory } from "../controllers/referral.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/my-code").get(getMyReferralCode);
router.route("/apply").post(applyReferralCode);
router.route("/history").get(getReferralHistory);

export default router;

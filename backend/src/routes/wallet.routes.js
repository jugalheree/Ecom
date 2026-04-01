import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getMyWallet, addMoney, withdrawMoney, getTransactions } from "../controllers/wallet.controller.js";

const router = Router();

router.use(verifyJWT); // all wallet routes require auth

router.route("/").get(getMyWallet);
router.route("/add").post(addMoney);
router.route("/withdraw").post(withdrawMoney);
router.route("/transactions").get(getTransactions);

export default router;

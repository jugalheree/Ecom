import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createAddress, getAddresses, deleteAddress, getProfile, updateProfile, changePassword } from "../controllers/user.controller.js";

const router = Router();

router.route('/profile')
  .get(verifyJWT, getProfile)
  .patch(verifyJWT, updateProfile);

router.route('/change-password')
  .post(verifyJWT, changePassword);

router.route('/address')
  .get(verifyJWT, getAddresses)
  .post(verifyJWT, createAddress);

router.route('/address/:id')
  .delete(verifyJWT, deleteAddress);

export default router;

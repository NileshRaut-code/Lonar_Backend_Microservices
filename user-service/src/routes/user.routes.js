import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateUserAvatar,
  updateUserCoverImage,
  updateAccountDetails,
  allProducts,
  allProductsLimitpage,
  forgotPassword,
  resetPassword
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import multer from "multer";

const upload = multer();
const router = Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/password/forgot").post(forgotPassword);

router.route("/password/reset/:token").put(resetPassword);

//secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);

router
  .route("/update-avatar")
  .patch(verifyJWT, upload.any("avatar", 1), updateUserAvatar);
router
  .route("/cover-image")
  .patch(verifyJWT, upload.any("coverImage", 1), updateUserCoverImage);

router.route("/allproduct").get(allProducts);
router.route("/allproduct/page/:id").get(allProductsLimitpage);

export default router;

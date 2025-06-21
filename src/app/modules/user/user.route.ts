import express from "express";
import { UserControllers } from "./user.controller";
import { validateRequest } from "../../middleWear/validateRequest";
import { UserValidations } from "./user.validation";
import auth from "../../middleWear/auth";
import USER_ROLE from "../../constants/userRole";
import { upload } from "../../utils/sendFileToCloudinary";

const router = express.Router();

router.get("/single/:id", UserControllers.getSingleUser);
router.get("/", auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN), UserControllers.getAllUsers);
router.get("/me", auth(USER_ROLE.VIEWER, USER_ROLE.ADMIN, USER_ROLE.CREATOR, USER_ROLE.USER, USER_ROLE.SUPER_ADMIN), UserControllers.getMe);
router.post(
  "/register",
  validateRequest(UserValidations.createUserValidationSchema),
  UserControllers.createAUser
);
router.post("/verify", UserControllers.verifyEmail);
router.post("/resend-verification", UserControllers.resendVerificationCode);


router.post(
  "/upload-image",
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  upload.single("file"),
  UserControllers.uploadImage
);
// here
router.patch(
  "/language",
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  validateRequest(UserValidations.changeLanguageValidationSchema),
  UserControllers.changeUserLanguage
);
router.patch(
  "/theme",
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  validateRequest(UserValidations.changeThemeValidationSchema),
  UserControllers.changeUserTheme
);

router.patch(
  "/delete/:id",
  auth(USER_ROLE.ADMIN),
  validateRequest(UserValidations.deleteUserValidationSchema),
  UserControllers.toggleUserDelete
);

export const UserRoutes = router;

import express from "express";
import { UserControllers } from "./user.controller";
import { validateRequest } from "../../middleWear/validateRequest";
import { UserValidations } from "./user.validation";
import auth from "../../middleWear/auth";
import USER_ROLE from "../../constants/userRole";
import { upload } from "../../utils/sendFileToCloudinary";

const router = express.Router();

router.get("/all-user", auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN), UserControllers.getAllUsers);
router.get("/me", auth(USER_ROLE.VIEWER, USER_ROLE.ADMIN, USER_ROLE.CREATOR, USER_ROLE.SUPER_ADMIN), UserControllers.getMe);
router.post(
  "/register",
  // validateRequest(UserValidations.createUserValidationSchema),
  UserControllers.createAUser
);

router.post(
  "/upload-image",
  auth(USER_ROLE.ADMIN, USER_ROLE.VIEWER, USER_ROLE.CREATOR, USER_ROLE.SUPER_ADMIN),
  upload.single("file"),
  UserControllers.uploadImage
);

router.patch(
  "/update-profile",
  auth(USER_ROLE.VIEWER, USER_ROLE.ADMIN, USER_ROLE.CREATOR, USER_ROLE.SUPER_ADMIN),
  UserControllers.updateProfile
);




export const UserRoutes = router;

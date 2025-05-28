import express from "express";
import { UserControllers } from "./user.controller";
import { validateRequest } from "../../middleWear/validateRequest";
import { UserValidations } from "./user.validation";
import auth from "../../middleWear/auth";
import USER_ROLE from "../../constants/userRole";

const router = express.Router();

router.get("/:id", UserControllers.getSingleUser);
router.get("/",auth(USER_ROLE.ADMIN), UserControllers.getAllUsers);
router.post(
  "/createAUser",
  validateRequest(UserValidations.createUserValidationSchema),
  UserControllers.createAUser
);

export const UserRoutes = router;

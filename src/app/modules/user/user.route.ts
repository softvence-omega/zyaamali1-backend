import express from "express";
import { UserControllers } from "./user.controller";
import { validateRequest } from "../../middleWear/validateRequest";
import { UserValidations } from "./user.validation";

const router = express.Router();

router.get("/:id", UserControllers.getSingleUser);
router.get("/", UserControllers.getAllUsers);
router.post(
  "/createAUser",
  validateRequest(UserValidations.createUserValidationSchema),
  UserControllers.createAUser
);

export const UserRoutes = router;

import express from "express";
import { validateRequest } from "../../middleWear/validateRequest";
import auth from "../../middleWear/auth";
import USER_ROLE from "../../constants/userRole";
import { businessController } from "./business.controller";

const router = express.Router();

router.post(
  "/add-business",
  // auth(USER_ROLE.ADMIN),
 businessController.postBusiness
);


export const businessRoutes = router;

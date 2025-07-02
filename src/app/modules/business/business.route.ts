import express from "express";
import { validateRequest } from "../../middleWear/validateRequest";
import auth from "../../middleWear/auth";
import USER_ROLE from "../../constants/userRole";
import { businessController } from "./business.controller";

const router = express.Router();

router.get(
  "/get-all-business",
  // auth(USER_ROLE.ADMIN),
  businessController.getAllBusiness
);

router.post(
  "/add-business",
  // auth(USER_ROLE.ADMIN),
 businessController.postBusiness
);

router.patch(
  "/update-business/:id",
  // auth(USER_ROLE.ADMIN),
  businessController.updateBusiness
);

router.delete(
  "/delete-business/:id",
  // auth(USER_ROLE.ADMIN),
  businessController.deleteBusiness
);


export const businessRoutes = router;

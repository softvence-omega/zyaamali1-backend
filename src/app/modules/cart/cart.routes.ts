import express from "express";
import { cartController } from "./cart.controller";
import { cartPostValidation, cartUpdateValidation } from "./cart.validation";
import { validateRequest } from "../../middleWear/validateRequest";
import auth from "../../middleWear/auth";
import USER_ROLE from "../../constants/userRole";

const router = express.Router();

router.post(
  "/create-cart",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  validateRequest(cartPostValidation),
  cartController.postCart
);
router.get(
  "/get-all-cart",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  cartController.getAllCart
);
router.get(
  "/get-single-cart/:id",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  cartController.getSingleCart
);
router.put(
  "/update-cart/:id",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),

  validateRequest(cartUpdateValidation),
  cartController.updateCart
);
router.delete(
  "/delete-cart/:id",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  cartController.deleteCart
);

export const cartRoutes = router;

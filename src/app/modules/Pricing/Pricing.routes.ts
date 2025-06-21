import express from "express";
import { PricingController } from "./Pricing.controller";
import {
  PricingPostValidation,
  PricingUpdateValidation,
} from "./Pricing.validation";
import { validateRequest } from "../../middleWear/validateRequest";
import auth from "../../middleWear/auth";
import USER_ROLE from "../../constants/userRole";

const router = express.Router();

router.post(
  "/create-pricing",
  auth(USER_ROLE.ADMIN),
  validateRequest(PricingPostValidation),
  PricingController.postPricing
);
router.get("/get-all-pricing", PricingController.getAllPricing);
router.get("/get-single-pricing/:id", PricingController.getSinglePricing);
router.put(
  "/update-pricing/:id",
  auth(USER_ROLE.ADMIN),

  validateRequest(PricingUpdateValidation),
  PricingController.updatePricing
);
router.delete("/delete-pricing/:id", auth(USER_ROLE.ADMIN), PricingController.deletePricing);

export const PricingRoutes = router;

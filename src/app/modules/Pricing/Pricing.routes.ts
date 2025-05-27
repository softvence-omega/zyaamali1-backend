import express from "express";
import { PricingController } from "./Pricing.controller";
import {
  PricingPostValidation,
  PricingUpdateValidation,
} from "./Pricing.validation";
import { validateRequest } from "../../middleWear/validateRequest";

const router = express.Router();

router.post(
  "/create_pricing",
  validateRequest(PricingPostValidation),
  PricingController.postPricing
);
router.get("/get_all_Pricing", PricingController.getAllPricing);
router.get("/get_single_Pricing/:id", PricingController.getSinglePricing);
router.put(
  "/update_Pricing/:id",
  validateRequest(PricingUpdateValidation),
  PricingController.updatePricing
);
router.delete("/delete_Pricing/:id", PricingController.deletePricing);

export const PricingRoutes = router;

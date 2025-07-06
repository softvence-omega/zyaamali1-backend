
import express from "express";
import { adCampainController } from "./adCampain.controller";
import { adCampainPostValidation, adCampainUpdateValidation } from "./adCampain.validation";
import { validateRequest } from "../../middleWear/validateRequest";

const router = express.Router();

router.post("/post-ads-campaign", adCampainController.postAdCampain);
router.get("/get-all-ads-campaign", adCampainController.getAllAdCampain);
router.get("/get-single-ads-campaign/:id", adCampainController.getSingleAdCampain);
router.put("/update-ads-campaign/:id",  adCampainController.updateAdCampain);
router.delete("/delete-ads-campaign/:id", adCampainController.deleteAdCampain);

export const adCampainRoutes = router;
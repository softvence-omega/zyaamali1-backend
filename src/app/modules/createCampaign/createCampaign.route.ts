import express from "express";
import {
  createCampaignController,
  createGoogleAdController,
} from "./createCampaign.controller";

const router = express.Router();

// facebook
router.post(
  "/facebook/upload-image",
  createCampaignController.uploadImageController
);
router.post("/facebook-ads", createCampaignController.createAdController);

// google
router.post("/google/create-ad", createGoogleAdController);

export const createAdsCampaignRoute = router;


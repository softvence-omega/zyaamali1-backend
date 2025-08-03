import express from "express";
import {
  createCampaignController,
  createGoogleAdController,
  createLinkedInAd,
} from "./createCampaign.controller";

const router = express.Router();

// facebook
router.post(
  "/facebook/upload-image",
  createCampaignController.uploadImageController
);
router.post("/facebook/create-ad", createCampaignController.createAdController);

// google
router.post("/google/create-ad", createGoogleAdController);

// linkedin
router.post("/linkedin/create-ad", createLinkedInAd);

export const createAdsCampaignRoute = router;

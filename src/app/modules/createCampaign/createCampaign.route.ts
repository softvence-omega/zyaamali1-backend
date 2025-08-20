import express from "express";
import {
  createCampaignController,
  createFullTiktokAdFlow,
  createGoogleAdController,
  createLeadFormController,
  createLinkedInAd,
} from "./createCampaign.controller";
import multer from "multer";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

// facebook
router.post("/facebook/lead-form", createLeadFormController);
router.post("/facebook/create-ad", createCampaignController.createAdController);

// google
router.post("/google/create-ad", createGoogleAdController);

// linkedin
router.post("/linkedin/create-ad", createLinkedInAd);

// tiktok

router.post(
  "/tiktok/ad/full",
  upload.fields([
    { name: "videoPath", maxCount: 1 },
    { name: "imagePath", maxCount: 1 },
    { name: "carouselImages", maxCount: 10 },
  ]),
  createFullTiktokAdFlow
);

export const createAdsCampaignRoute = router;

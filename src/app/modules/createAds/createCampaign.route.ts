import express from "express";
import {
  createCampaignController,
  createFullTiktokAdFlow,
  createGoogleAdController,
  createLeadFormController,
  createLinkedInAd,
  getLinkedinController,
} from "./createCampaign.controller";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 200, // 200MB
    files: 20,
  },
});

// facebook
router.post("/facebook/lead-form", createLeadFormController);
router.post("/facebook/create-ad", createCampaignController.createAdController);

// google
router.post("/google/create-ad", createGoogleAdController);

// linkedin
router.get("/linkedin/campaigns", getLinkedinController);
router.post("/linkedin/create-ad", createCampaignController.createLinkedInAd);

// tiktok

router.post(
  "/tiktok/create-ad",
 upload.fields([
    { name: "videoPath", maxCount: 1 },
    { name: "imagePath", maxCount: 1 },
    { name: "carouselImages", maxCount: 10 },
  ]),
  createFullTiktokAdFlow
);

export const createAdsCampaignRoute = router;

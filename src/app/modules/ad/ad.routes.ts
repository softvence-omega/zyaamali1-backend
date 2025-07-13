import express from "express";
import {
  createCampaign,
  createAdSet,
  createAd
} from "./ad.controller";

const router = express.Router();

router.post("/campaign", createCampaign);
router.post("/adset", createAdSet);
router.post("/ad", createAd);

export default router;

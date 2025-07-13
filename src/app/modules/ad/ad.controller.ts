import { Request, Response } from "express";
import { Campaign } from "./ad.model";
import { AdSet } from "./ad.model";
import { Ad } from "./ad.model";

// Create Campaign
export const createCampaign = async (req: Request, res: Response) => {
  try {
    const campaign = await Campaign.create(req.body);
    res.status(201).json({ success: true, data: campaign });
  } catch (err) {
    res.status(500).json({ success: false, message: err });
  }
};

// Create AdSet
export const createAdSet = async (req: Request, res: Response) => {
  try {
    const adSet = await AdSet.create(req.body);
    res.status(201).json({ success: true, data: adSet });
  } catch (err) {
    res.status(500).json({ success: false, message: err });
  }
};

// Create Ad
export const createAd = async (req: Request, res: Response) => {
  try {
    const ad = await Ad.create(req.body);
    res.status(201).json({ success: true, data: ad });
  } catch (err) {
    res.status(500).json({ success: false, message: err });
  }
};

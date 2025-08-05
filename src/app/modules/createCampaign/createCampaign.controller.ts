import { Request, Response } from "express";
import {
  createAdCampaign,
  createAdCreative,
  createCampaignService,
  createGoogleAdService,
} from "./createCampaign.service";

// facebook
const uploadImageController = async (req: Request, res: Response) => {
  try {
    const { accessToken, adAccountId, imageUrl } = req.body;

    if (!accessToken || !adAccountId || !imageUrl) {
      return res.status(400).json({
        message:
          "Missing required parameters like accessToken, adAccountId, or imageUrl",
      });
    }

    const imageHash = await createCampaignService.uploadImageService(
      accessToken,
      adAccountId,
      imageUrl
    );

    return res.status(200).json({ imageHash });
  } catch (error: any) {
    console.error(
      "❌ Upload Image Error:",
      error.response?.data || error.message
    );
    return res.status(500).json({
      message: "Failed to upload image",
      error: error.response?.data || error.message,
    });
  }
};

const createAdController = async (req: Request, res: Response) => {
  const { accessToken, adAccountId, pageId, imageHash } = req.body;

  if (!accessToken || !adAccountId || !pageId || !imageHash) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  try {
    const result = await createCampaignService.createAdService(
      accessToken,
      adAccountId,
      pageId,
      imageHash
    );
    return res.status(200).json({ message: "✅ Safe test ad created", result });
  } catch (error: any) {
    console.error("❌ Error in controller:", error.message || error);
    return res.status(500).json({ message: "Failed to create test ad" });
  }
};

// google

export const createGoogleAdController = async (req: Request, res: Response) => {
  const { customerId, refreshToken, finalUrl } = req.body;
  console.log(customerId, refreshToken, finalUrl);

  if (!customerId || !refreshToken || !finalUrl) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const adResult = await createGoogleAdService({
      customerId,
      refreshToken,
      finalUrl,
    });
    res
      .status(201)
      .json({ message: "Ad created successfully!", data: adResult });
  } catch (err: any) {
    console.error("Ad creation error:", err);
    res
      .status(500)
      .json({ message: "Failed to create ad", error: err.message });
  }
};

// linkedin

export const createLinkedInAd = async (req: Request, res: Response) => {
  const { accessToken, adAccountUrn, organizationUrn, landingPageUrl } =
    req.body;

  try {
    const campaign = await createAdCampaign(accessToken, adAccountUrn);
    const creative = await createAdCreative(
      accessToken,
      adAccountUrn,
      organizationUrn,
      landingPageUrl
    );

    res.status(200).json({
      message: "Ad campaign and creative created successfully",
      campaign,
      creative,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createCampaignController = {
  uploadImageController,
  createAdController,
};

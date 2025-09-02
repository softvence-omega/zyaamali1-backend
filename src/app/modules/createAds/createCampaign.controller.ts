import { Request, Response } from "express";
import {
  createCampaignService,
  createGoogleAdService,
  createTikTokFullAd,
  facebookLeadFormService,
  getLinkedinCampaignsService,
} from "./createCampaign.service";

// facebook

// src/controllers/facebookLeadForm.controller.ts

export const createLeadFormController = async (req: Request, res: Response) => {
  try {
    const { pageAccessToken, pageId } = req.body;

    if (!pageAccessToken || !pageId) {
      return res
        .status(400)
        .json({ error: "pageAccessToken and pageId are required" });
    }

    const leadForm = await facebookLeadFormService.createLeadForm(
      pageAccessToken,
      pageId
    );

    res.status(201).json({
      message: "✅ Lead form created successfully",
      leadFormId: leadForm.id,
    });
  } catch (error: any) {
    console.error("❌ Error in lead form controller:", error.message);
    res
      .status(500)
      .json({ error: error.message || "Failed to create lead form" });
  }
};

export const createAdController = async (req: Request, res: Response) => {
  try {
    const {
      accessToken,
      adAccountId,
      pageId,
      application_id,
      adType,
      campaignName,
      adSetName,
      adName,
      dailyBudget,
      targeting,
      link,
      message,
      callToActionType,
      imageUrl,
      videoId,
    } = req.body;
    console.log(req.body);

    console.log(adType, "from controller ");
    // Validate required fields
    if (!accessToken || !adAccountId || !pageId) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required parameters: accessToken, adAccountId, or pageId",
      });
    }

    // Call service
    const result = await createCampaignService.createAdsFacebookAdService(
      accessToken,
      adAccountId,
      pageId,
      application_id,
      adType,
      campaignName,
      adSetName,
      adName,
      dailyBudget,
      targeting,
      link,
      message,
      callToActionType,
      imageUrl,
      videoId
    );

    return res.status(200).json({
      success: true,
      message: `✅ FACEBOOK ${adType} ad created successfully`,
      data: result,
    });
  } catch (error: any) {
    console.error(
      "❌ Error in facebook createAdController:",
      error?.response?.data || error.message
    );
    res.status(500).json({
      success: false,
      message: "Failed to create ad",
      error: error?.response?.data || error.message,
    });
  }
};

// google

export const createGoogleAdController = async (req: Request, res: Response) => {
  const {
    customerId,
    refreshToken,
    finalUrl,
    adType, // e.g. SEARCH, DISPLAY, VIDEO
    budgetAmountMicros,
    campaignName,
    adGroupName,
    cpcBidMicros,
    headlines,
    descriptions,
    images,
    videoUrl,
  } = req.body;
  console.log(req.body);

  if (!customerId || !refreshToken || !finalUrl || !adType) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const adResult = await createGoogleAdService({
      customerId,
      refreshToken,
      finalUrl,
      adType,
      budgetAmountMicros,
      campaignName,
      adGroupName,
      cpcBidMicros,
      headlines,
      descriptions,
      images,
      videoUrl,
    });

    res.status(201).json({
      message: `${adType} ad created successfully!`,
      data: adResult,
    });
  } catch (err: any) {
    console.error("Ad creation error:", err);
    res.status(500).json({
      message: "Failed to create ad",
      error: err,
    });
  }
};

// linkedin

export const getLinkedinController = async (req: Request, res: Response) => {
  const accessToken = (req.headers.authorization?.replace("Bearer ", "") ||
    req.query.accessToken) as string;

  const advertiserId = (req.query.advertiserId as string) || "";

  if (!accessToken || !advertiserId)
    return res
      .status(400)
      .json({ error: "Missing accessToken or advertiserId" });
  try {
    const data = await getLinkedinCampaignsService(accessToken, advertiserId);
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.response?.data || e.message });
  }
};

export const createLinkedInAd = async (req: Request, res: Response) => {
  try {
    const {
      accessToken,
      advertiserId,
      campaignName,
      creativeText,
      landingPageUrl,
    } = req.body;

    if (
      !accessToken ||
      !advertiserId ||
      !campaignName ||
      !creativeText ||
      !landingPageUrl
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const ad = await createCampaignService.createLinkedInAd({
      accessToken,
      advertiserId,
      campaignName,
      creativeText,
      landingPageUrl,
    });
    console.log("linkedin ads ", ad);

    res.json(ad);
  } catch (error: any) {
    console.error("Error creating ad:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
};

// tiktok

export const createFullTiktokAdFlow = async (req: Request, res: Response) => {
  const {
    campaign_name,
    adgroup_name,
    ad_name,
    adType,
    ad_text,
    call_to_action,
    landing_page_url,
    budget,
    bid_price,
    objective_type,
    promotion_type,
    location_ids,
    post_id,
  } = JSON.parse(req.body.othersField);

  console.log(
    campaign_name,
    adgroup_name,
    ad_name,
    ad_text,
    call_to_action,
    landing_page_url,
    budget,
    adType,
    bid_price,
    objective_type,
    promotion_type,
    location_ids,
    post_id,
    "bodyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy"
  );

  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const videoFile = files?.videoPath?.[0];
    const imageFile = files?.imagePath?.[0];
    const carouselFiles = files?.carouselImages;

    if (!adType) {
      return res.status(400).json({ error: "adType is required" });
    }

    // Ad type validation
    switch (adType) {
      case "SINGLE_VIDEO":
        if (!videoFile)
          return res.status(400).json({ error: "videoPath is required" });
        break;
      case "SPARK_AD":
        if (!post_id)
          return res
            .status(400)
            .json({ error: "postId is required for SPARK_AD" });
        break;
      case "SINGLE_IMAGE":
        if (!imageFile)
          return res.status(400).json({ error: "imagePath is required" });
        break;
      case "CAROUSEL":
        if (!carouselFiles || carouselFiles.length === 0) {
          return res
            .status(400)
            .json({ error: "At least one carousel image is required" });
        }
        break;
      default:
        return res.status(400).json({ error: "Unsupported ad type" });
    }

    const carouselImagePaths = carouselFiles
      ? carouselFiles.map((f) => f.path)
      : [];

    // Pass dynamic data from req.body
    const result = await createTikTokFullAd(
      adType,
      videoFile?.path,
      imageFile?.path,
      post_id,
      carouselImagePaths.length > 0 ? carouselImagePaths : undefined,
      {
        campaign_name,
        adgroup_name,
        ad_name,
        ad_text,
        call_to_action,
        landing_page_url,
        budget: Number(budget) || 100,
        bid_price: Number(bid_price) || 2,
        objective_type: objective_type || "TRAFFIC",
        promotion_type: promotion_type || "WEBSITE",
        location_ids: location_ids ? location_ids.split(",") : ["1210997"],
      }
    );

    res.json({
      success: true,
      message: "TikTok ad created successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("❌ TikTok Ad create error:", error.message);
    res
      .status(500)
      .json({ error: error.message || "Failed to create TikTok ad" });
  }
};

export const createCampaignController = {
  createAdController,
  createLinkedInAd,
};

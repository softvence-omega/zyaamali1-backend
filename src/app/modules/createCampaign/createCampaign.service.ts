const bizSdk = require("facebook-nodejs-business-sdk");
const { FacebookAdsApi, AdAccount, Campaign, AdSet, AdCreative, Ad } = bizSdk;

import { googleAdsClient } from "../../utils/googleAdsClient";

import axios from "axios";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import sizeOf from "image-size";
import crypto from "crypto";
import FormData from "form-data";
import sharp from "sharp";
import { liAxios } from "../../utils/getLinkedinCampaignId";
import { error } from "console";
import {
  buildDisplayAdPayload,
  buildSearchAdPayload,
  buildVideoAdPayload,
  createAd,
  createAdGroup,
  createBudget,
  createCampaign,
} from "./campaignUtils/CreateGoogleAdsFunction";
import {
  buildFacebookAdObjectiveAndCreative,
  createFacebookAd,
  createFacebookAdCreative,
  createFacebookAdSet,
  createFacebookCampaign,
} from "./campaignUtils/createFacebookAdsFunction";
import { uploadCarouselImages, uploadImage, uploadVideo } from "./campaignUtils/createTiktokAdsFunction";

// facebook

// src/services/facebookLeadForm.service.ts

class FacebookLeadFormService {
  async createLeadForm(pageAccessToken: string, pageId: string) {
    try {
      const url = `https://graph.facebook.com/v23.0/${pageId}/leadgen_forms`;

      const payload = {
        name: "🚀 My Auto Lead Form",
        follow_up_action_url: "https://adelo.ai",
        questions: JSON.stringify([
          { type: "FULL_NAME" },
          { type: "EMAIL" },
          { type: "PHONE" },
          {
            type: "CUSTOM",
            label: "What service are you interested in?",
            options: [
              { label: "Web Development", value: "web_dev" },
              { label: "SEO", value: "seo" },
              { label: "Marketing", value: "marketing" },
            ],
          },
        ]),
        privacy_policy: JSON.stringify({
          url: "https://adelo.ai/privacy-policy",
          link_text: "View our Privacy Policy",
        }),
        thank_you_screen: JSON.stringify({
          title: "Thanks!",
          body: "We’ll contact you shortly.",
          button_text: "Visit Website",
          button_url: "https://adelo.ai",
        }),
        locale: "EN_US",
        access_token: pageAccessToken,
      };

      const res = await axios.post(url, payload);
      return res.data; // { id: 'FORM_ID', success: true }
    } catch (error: any) {
      console.error(
        "❌ Failed to create lead form:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.error?.message || "Lead form creation failed"
      );
    }
  }
}

export const facebookLeadFormService = new FacebookLeadFormService();

export const createFacebookAdService = async (
  accessToken: string,
  adAccountId: string,
  pageId: string,
  adType: string,
  campaignName: string,
  adSetName: string,
  adName: string,
  dailyBudget: string,
  targeting: any,
  link: string,
  message: string,
  callToActionType: string,
  imageUrl: string,
  videoId: string
) => {
  try {
    // 1️⃣ Build objective + creative
    const { objective, optimizationGoal, billingEvent, creativePayload } =
      buildFacebookAdObjectiveAndCreative(
        adType,
        pageId,
        link,
        message,
        callToActionType,
        imageUrl,
        videoId
      );

    // 2️⃣ Campaign
    const campaignId = await createFacebookCampaign(
      adAccountId,
      campaignName,
      objective,
      accessToken
    );

    // 3️⃣ Ad Set
    const adSetId = await createFacebookAdSet(
      adAccountId,
      adSetName,
      campaignId,
      dailyBudget,
      billingEvent,
      optimizationGoal,
      accessToken,
      targeting,
      adType
    );

    // 4️⃣ Creative
    const creativeId = await createFacebookAdCreative(
      adAccountId,
      adType,
      creativePayload,
      accessToken
    );

    // 5️⃣ Ad
    const adId = await createFacebookAd(
      adAccountId,
      adName,
      adSetId,
      creativeId,
      accessToken
    );

    return {
      success: true,
      message: `${adType} ad created successfully`,
      data: { campaignId, adSetId, creativeId, adId },
    };
  } catch (err: any) {
    console.error("❌ Error creating ad:", err.response?.data || err.message);
    return err.response;
  }
};

// google
export const createGoogleAdService = async (params: any) => {
  const {
    customerId,
    refreshToken,
    adType,
    budgetAmountMicros,
    campaignName,
    adGroupName,
    cpcBidMicros,
    headlines,
    descriptions,
    longHeadline,
    businessName,
    images,
    videoUrl,
    finalUrl,
    containsEuPoliticalAdvertising = false,
  } = params;

  const customer = googleAdsClient.Customer({
    customer_id: customerId,
    refresh_token: refreshToken,
  });

  // Campaign Setup
  const budgetResourceName = await createBudget(customer, budgetAmountMicros);
  const campaignResourceName = await createCampaign(
    customer,
    budgetResourceName,
    adType,
    campaignName
  );
  const adGroupResourceName = await createAdGroup(
    customer,
    campaignResourceName,
    adGroupName,
    cpcBidMicros
  );

  // Build Ad Payload
  let adPayload;
  switch (adType.trim().toUpperCase()) {
    case "SEARCH":
      adPayload = buildSearchAdPayload(headlines, descriptions, finalUrl);
      break;
    case "DISPLAY":
      adPayload = await buildDisplayAdPayload(
        customer,
        images,
        headlines,
        descriptions,
        longHeadline,
        businessName,
        finalUrl
      );
      break;
    case "VIDEO":
      adPayload = await buildVideoAdPayload(
        customer,
        videoUrl,
        headlines,
        descriptions,
        finalUrl
      );
      break;
    default:
      throw new Error(`Ad type "${adType}" is not supported.`);
  }

  // Final Ad Creation
  return await createAd(
    customer,
    adGroupResourceName,
    adPayload,
    adType,
    containsEuPoliticalAdvertising
  );
};

// linkedin

interface LinkedInAdInput {
  accessToken: string;
  advertiserId: string;
  campaignName: string;
  creativeText: string;
  landingPageUrl: string;
}

export const getLinkedinCampaignsService = async (
  accessToken: string,
  advertiserId: string
) => {
  const http = liAxios(accessToken);

  // IMPORTANT: you currently cannot create campaigns via API without rw_campaigns. Fetch existing ones.
  const { data } = await http.get("/v2/adCampaignsV2", {
    params: {
      q: "search",
      "search.account.values[0]": `urn:li:sponsoredAccount:${advertiserId}`,
    },
  });
  console.log("=============================", data);
  return data;
};

export const createLinkedInAd = async ({
  accessToken,
  advertiserId,
  campaignName,
  creativeText,
  landingPageUrl,
}: LinkedInAdInput) => {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "X-Restli-Protocol-Version": "2.0.0",
    "Content-Type": "application/json",
  };

  // 1️⃣ Create Campaign
  const campaignRes = await axios.post(
    "https://api.linkedin.com/v2/adCampaigns",
    {
      account: `urn:li:sponsoredAccount:${advertiserId}`,
      name: campaignName,
      dailyBudget: { amount: 1000, currencyCode: "USD" },
      type: "TEXT_AD", // or "SPONSORED_UPDATES"
      status: "ACTIVE",
    },
    { headers }
  );

  const campaignId = campaignRes.data.id;

  // 2️⃣ Create Creative
  const creativeRes = await axios.post(
    "https://api.linkedin.com/v2/adCreatives",
    {
      campaign: `urn:li:sponsoredCampaign:${campaignId}`,
      reference: {
        reference: {
          textAd: {
            headline: creativeText,
            landingPageUrl: landingPageUrl,
          },
        },
      },
    },
    { headers }
  );

  const creativeId = creativeRes.data.id;

  // 3️⃣ Create Ad
  const adRes = await axios.post(
    "https://api.linkedin.com/v2/adDirectSponsoredContents",
    {
      account: `urn:li:sponsoredAccount:${advertiserId}`,
      creative: `urn:li:sponsoredCreative:${creativeId}`,
      status: "ACTIVE",
    },
    { headers }
  );

  return {
    campaignId,
    creativeId,
    ad: adRes.data,
  };
};

// TikTok
export const createTikTokFullAd = async (
  adType: string,
  videoPath?: string,
  imagePath?: string,
  postId?: string,
  carouselImages?: string[]
) => {
  try {
    console.log(`📦 Starting TikTok ${adType} ad creation flow`);

    // Step 1: Upload Media
    const video_id =
      ["SINGLE_VIDEO", "SPARK_AD"].includes(adType) && videoPath
        ? await uploadVideo(videoPath)
        : undefined;

    const image_id =
      ["SINGLE_IMAGE", "SINGLE_VIDEO"].includes(adType) && imagePath
        ? await uploadImage(imagePath)
        : undefined;

    const image_ids =
      adType === "CAROUSEL" && carouselImages?.length
        ? await uploadCarouselImages(carouselImages)
        : [];

    // Step 2: Create Campaign + AdGroup
    const campaign_id = await createCampaign();
    const adgroup_id = await createAdGroup(campaign_id);

    // Step 3: Get Identity
    const identity = await getIdentity();

    // Step 4: Build Creative
    const creativePayload = buildCreativePayload(
      adType,
      { video_id, image_id, image_ids },
      identity,
      postId
    );

    // Step 5: Create Ad
    const adId = await createAd(adgroup_id, creativePayload, adType);

    console.log("✅ Ad created:", adId);

    return {
      adType,
      adId,
      campaign_id,
      adgroup_id,
      video_id,
      image_id,
      image_ids,
    };
  } catch (err: any) {
    console.error("❌ TikTok Ad create error:", err.message);
    throw err;
  }
};

export const createCampaignService = {
  createFacebookAdService,
  createLinkedInAd,
};

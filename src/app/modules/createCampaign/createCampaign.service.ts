const bizSdk = require("facebook-nodejs-business-sdk");
const { FacebookAdsApi, AdAccount, Campaign, AdSet, AdCreative, Ad } = bizSdk;

import { googleAdsClient } from "../../utils/googleAdsClient";

import axios from "axios";
import fs from "fs";
import path from "path";

import sizeOf from "image-size";
import crypto from "crypto";
import FormData from "form-data";
import sharp from "sharp";

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

export const createAdService = async (
  accessToken: string,
  adAccountId: string, // without "act_"
  pageId: string,
  imageUrl: any
) => {
  try {
    // 1️⃣ Create Campaign
    const campaignRes = await axios.post(
      `https://graph.facebook.com/v23.0/act_${adAccountId}/campaigns`,
      {
        name: "🚀 My Traffic Campaign",
        objective: "OUTCOME_TRAFFIC",
        status: "PAUSED",
        special_ad_categories: [],
        access_token: accessToken,
      }
    );
    const campaignId = campaignRes.data.id;
    console.log(`✅ Campaign created: ${campaignId}`);

    // 2️⃣ Create Ad Set
    const adSetRes = await axios.post(
      `https://graph.facebook.com/v23.0/act_${adAccountId}/adsets`,
      {
        name: "🚀 Traffic Ad Set (FB only)",
        campaign_id: campaignId,
        daily_budget: 125,
        billing_event: "IMPRESSIONS",
        optimization_goal: "LINK_CLICKS",
        bid_strategy: "LOWEST_COST_WITHOUT_CAP",
        start_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        targeting: {
          geo_locations: { countries: ["BD"] },
          age_min: 18,
          age_max: 65,
          publisher_platforms: ["facebook"], // only Facebook
          facebook_positions: ["feed"], // Facebook feed only
        },
        status: "PAUSED",
        access_token: accessToken,
      }
    );
    const adSetId = adSetRes.data.id;
    console.log(`✅ Ad Set created: ${adSetId}`);

    // 3️⃣ Create Ad Creative (force FB only, no IG actor)
    const creativeRes = await axios.post(
      `https://graph.facebook.com/v23.0/act_${adAccountId}/adcreatives`,
      {
        name: "🚀 Traffic Creative (FB only)",
        object_story_spec: {
          page_id: pageId,
          instagram_actor_id: null, // ✅ prevent IG linking
          link_data: {
            link: "https://adelo.ai",
            message: "Click here to learn more!",
            call_to_action: {
              type: "LEARN_MORE",
              value: { link: "https://adelo.ai" },
            },
            // ✅ Ensure placement is FB-only
            multi_share_end_card: false,
          },
        },
        access_token: accessToken,
      }
    );
    const creativeId = creativeRes.data.id;
    console.log(`✅ Creative created: ${creativeId}`);

    // 4️⃣ Create Ad
    const adRes = await axios.post(
      `https://graph.facebook.com/v23.0/act_${adAccountId}/ads`,
      {
        name: "My Traffic Ad (FB only)",
        adset_id: adSetId,
        creative: { creative_id: creativeId },
        status: "PAUSED",
        access_token: accessToken,
      }
    );
    console.log(`✅ Ad created: ${adRes.data.id}`);
    return adRes.data;
  } catch (err: any) {
    console.error(
      "❌ Failed to create Traffic Ad:",
      err.response?.data || err.message
    );
    throw new Error(
      err.response?.data?.error?.message || "Traffic ad creation failed"
    );
  }
};

// google

export const createGoogleAdService = async ({
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
}: any) => {
  const customer = googleAdsClient.Customer({
    customer_id: customerId,
    refresh_token: refreshToken,
  });

  // Validate image aspect ratio before uploading
  const validateAspectRatio = (
    buffer: Buffer,
    expectedRatio: number,
    tolerance = 0.01
  ) => {
    const { width, height } = sizeOf(buffer);
    const ratio = width / height;
    console.log(ratio);
    if (Math.abs(ratio - expectedRatio) > tolerance) {
      console.warn(
        `⚠ Aspect ratio mismatch. Expected ${expectedRatio}, got ${ratio.toFixed(
          2
        )}. Will resize.`
      );
      return false;
    }
    return true;
  };

  // Upload Image Asset (with exact resize)
  const uploadImageAsset = async (
    imageUrl: string,
    type: "LANDSCAPE" | "SQUARE" | "LOGO",
    customer: any
  ) => {
    const timestamp = Date.now();

    // Download image
    const { data } = await axios.get(imageUrl, { responseType: "arraybuffer" });

    // Set required dimensions
    let targetWidth: number, targetHeight: number, expectedRatio: number;
    if (type === "LANDSCAPE") {
      targetWidth = 1200;
      targetHeight = 628;
      expectedRatio = 1.91;
    } else if (type === "SQUARE") {
      targetWidth = 1200;
      targetHeight = 1200;
      expectedRatio = 1.0;
    } else {
      targetWidth = 512;
      targetHeight = 512;
      expectedRatio = 1.0;
    }

    // Resize & clean image → buffer
    const processedBuffer = await sharp(data)
      .resize(targetWidth, targetHeight, {
        fit: "cover",
        position: "center",
        withoutEnlargement: true,
      })
      .flatten({ background: "#ffffff" }) // remove transparency
      .jpeg({ quality: 100 })
      .toBuffer();

    // Validate final size
    const { width, height } = sizeOf(processedBuffer);
    console.log(`✅ Final ${type}: ${width}x${height}`);

    // Upload to Google Ads directly from buffer
    const assetResult = await customer.assets.create([
      {
        name: `${type}_Asset_${timestamp}`,
        type: "IMAGE",
        image_asset: {
          data: processedBuffer, // Use buffer directly
        },
      },
    ]);

    const assetName = assetResult.results[0].resource_name;
    console.log(`✅ Uploaded ${type} → ${assetName}`);
    return assetName;
  };

  // Upload Video Asset
  const uploadVideoAsset = async (videoUrl: string) => {
    const asset = await customer.assets.create([
      {
        name: `Video_Asset_${Date.now()}`,
        type: "YOUTUBE_VIDEO",
        youtube_video_asset: {
          youtube_video_id: videoUrl.includes("youtube.com")
            ? videoUrl.split("v=")[1]
            : null,
        },
      },
    ]);
    return asset.results[0].resource_name;
  };

  // 1. Budget
  const budget = await customer.campaignBudgets.create([
    {
      name: `Budget_${Date.now()}`,
      amount_micros: budgetAmountMicros || 2_500_000,
      delivery_method: "STANDARD",
    },
  ]);
  const budgetResourceName = budget.results[0].resource_name;

  // 2. Campaign
  const uniqueSuffix = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const campaign = await customer.campaigns.create([
    {
      name: `${campaignName || "Campaign"}_${uniqueSuffix}`,
      advertising_channel_type: adType.toUpperCase(),
      status: "PAUSED",
      manual_cpc: {},
      campaign_budget: budgetResourceName,
    },
  ]);
  const campaignResourceName = campaign.results[0].resource_name;

  // 3. Ad Group
  const adGroup = await customer.adGroups.create([
    {
      name: adGroupName || `AdGroup_${Date.now()}`,
      campaign: campaignResourceName,
      status: "PAUSED",
      cpc_bid_micros: cpcBidMicros || 1_000_000,
    },
  ]);
  const adGroupResourceName = adGroup.results[0].resource_name;

  // 4. Ad Creative
  let adPayload: any;
  switch (adType.toUpperCase()) {
    case "SEARCH":
      adPayload = {
        responsive_search_ad: {
          headlines: headlines || [
            { text: "Default Headline 1" },
            { text: "Default Headline 2" },
          ],
          descriptions: descriptions || [
            { text: "Default Description 1" },
            { text: "Default Description 2" },
          ],
        },
        final_urls: [finalUrl],
      };
      break;

    case "DISPLAY":
      if (!images?.landscape || !images?.square || !images?.logo) {
        throw new Error(
          "Landscape, square, and logo images are required for DISPLAY ads"
        );
      }

      const landscapeAsset = await uploadImageAsset(
        images.landscape,
        "LANDSCAPE",
        customer
      );
      const squareAsset = await uploadImageAsset(
        images.square,
        "SQUARE",
        customer
      );
      const logoAsset = await uploadImageAsset(images.logo, "LOGO", customer);

      adPayload = {
        responsive_display_ad: {
          headlines,
          long_headline: { text: "Biggest Sale of the Year!" },
          descriptions,
          business_name: "Your Business Name",
          marketing_images: [{ asset: landscapeAsset }],
          square_marketing_images: [{ asset: squareAsset }],
          logo_images: [{ asset: logoAsset }],
        },
        final_urls: [finalUrl],
      };
      break;

    case "VIDEO":
      if (!videoUrl) throw new Error("Video URL is required for VIDEO ads");
      const videoAssetName = await uploadVideoAsset(videoUrl);
      adPayload = {
        video_ad: {
          media_file: videoAssetName,
        },
        final_urls: [finalUrl],
      };
      break;

    default:
      throw new Error(`Ad type "${adType}" is not supported.`);
  }

  // 5. Create Ad
  const ad = await customer.adGroupAds.create([
    {
      ad_group: adGroupResourceName,
      status: "PAUSED",
      ad: adPayload,
    },
  ]);

  console.log(`${adType} Ad created:`, ad);
  return ad.results[0];
};

// linkedin

export const createAdCampaign = async (
  accessToken: string,
  adAccountUrn: string
) => {
  const url = "https://api.linkedin.com/v2/adCampaignsV2";

  const body = {
    account: adAccountUrn,
    campaignGroup: `${adAccountUrn.replace(
      "sponsoredAccount",
      "sponsoredCampaignGroup"
    )}`,
    name: "Auto Campaign",
    dailyBudget: {
      amount: 5000, // $50.00
      currencyCode: "USD",
    },
    objectiveType: "WEBSITE_VISITS",
    status: "ACTIVE",
  };

  const res = await axios.post(url, body, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
  });

  return res.data;
};

export const createAdCreative = async (
  accessToken: string,
  adAccountUrn: string,
  organizationUrn: string,
  landingPageUrl: string
) => {
  const url = "https://api.linkedin.com/v2/adCreativesV2";

  const body = {
    account: adAccountUrn,
    name: "Auto Creative",
    type: "TEXT_AD",
    status: "ACTIVE",
    reference: {
      reference: organizationUrn,
    },
    textAd: {
      headline: "Grow with LinkedIn",
      description: "Click to scale your business",
      landingPageUrl,
    },
  };

  const res = await axios.post(url, body, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
  });

  return res.data;
};

// TikTok

const ACCESS_TOKEN = "3e2fd8a054e0a2e2bf3be64b89cda471ff6c5044"; // Replace
const ADVERTISER_ID = "7538282648226054162"; // Replace
const BASE_URL = "https://business-api.tiktok.com/open_api/v1.3";
const COUNTRY_CODE = process.env.COUNTRY_CODE || "BD"; // Change default country

const headers = { "Access-Token": ACCESS_TOKEN };

// Utility to get MD5 of a file
const getFileMD5 = (filePath: string) => {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash("md5").update(fileBuffer).digest("hex");
};

// Upload Video
const uploadVideo = async (videoPath: string) => {
  const url = `${BASE_URL}/file/video/ad/upload/`;
  const videoSignature = getFileMD5(videoPath);

  const form = new FormData();
  form.append("advertiser_id", ADVERTISER_ID);
  form.append("upload_type", "UPLOAD_BY_FILE");
  form.append("video_signature", videoSignature);
  form.append("video_file", fs.createReadStream(videoPath));

  const res = await axios.post(url, form, {
    headers: { ...headers, ...form.getHeaders() },
  });
  if (res.data.code !== 0)
    throw new Error(`Video upload failed: ${res.data.message}`);

  console.log("✅ Video uploaded:", res.data.data);
  return res.data.data.video_id;
};

// Upload Image
const uploadImage = async (imagePath: string) => {
  const url = `${BASE_URL}/file/image/ad/upload/`;
  const imageSignature = getFileMD5(imagePath);

  const form = new FormData();
  form.append("advertiser_id", ADVERTISER_ID);
  form.append("upload_type", "UPLOAD_BY_FILE");
  form.append("image_signature", imageSignature);
  form.append("image_file", fs.createReadStream(imagePath));

  const res = await axios.post(url, form, {
    headers: { ...headers, ...form.getHeaders() },
  });
  if (res.data.code !== 0)
    throw new Error(`Image upload failed: ${res.data.message}`);

  console.log("✅ Image uploaded:", res.data.data);
  return res.data.data.image_id;
};

// Create Campaign
const createCampaign = async () => {
  const url = `${BASE_URL}/campaign/create/`;
  const payload = {
    advertiser_id: ADVERTISER_ID,
    campaign_name:
      "My First TikTok CatdderedddmdddDddddSdssddsddDdddkfdfFDFdddSpaigDFDFn 45345",
    objective_type: "TRAFFIC",
    budget_mode: "BUDGET_MODE_DAY",
    budget: 100,
    operation_status: "DISABLE", // paused
  };

  const res = await axios.post(url, payload, { headers });
  if (res.data.code !== 0)
    throw new Error(`Campaign creation failed: ${res.data.message}`);

  console.log("✅ Campaign created:", res.data.data);
  return res.data.data.campaign_id;
};

// Helper for UTC time
const getUTCDateTime = (date = new Date()) =>
  date.toISOString().slice(0, 19).replace("T", " ");

// Create Ad Group
const createAdGroup = async (campaign_id: string) => {
  const url = `${BASE_URL}/adgroup/create/`;
  const payload = {
    advertiser_id: ADVERTISER_ID,
    campaign_id,
    adgroup_name: "My First Ad Group",
    promotion_type: "WEBSITE",
    placement_type: "PLACEMENT_TYPE_NORMAL",
    placements: ["PLACEMENT_TIKTOK"],
    schedule_type: "SCHEDULE_FROM_NOW",
    schedule_start_time: getUTCDateTime(),
    budget_mode: "BUDGET_MODE_DAY",
    budget: 100, // USD
    billing_event: "CPC",
    optimization_goal: "CLICK",
    bid_type: "BID_TYPE_CUSTOM",
    operation_status: "DISABLE",
    location_ids: ["1210997"], // must be string
    bid_price: 2,
  };

  const res = await axios.post(url, payload, { headers });
  if (res.data.code !== 0)
    throw new Error(`Ad group creation failed: ${res.data.message}`);

  console.log("✅ Ad group created:", res.data.data);
  return res.data.data.adgroup_id;
};

// ✅ Fetch identities for the advertiser
const getIdentity = async () => {
  const url = `${BASE_URL}/identity/get/?advertiser_id=${ADVERTISER_ID}`;
  const res = await axios.get(url, { headers });

  if (res.data.code !== 0) {
    throw new Error(`Failed to fetch identities: ${res.data.message}`);
  }

  const identities = res.data.data.list;
  if (!identities || identities.length === 0) {
    throw new Error("No identities found for this advertiser.");
  }
  console.log(
    identities[0].identity_id,
    identities[0].identity_type,
    "-----------------------------------------"
  );

  return {
    identity_id: identities[0].identity_id,
    identity_type: identities[0].identity_type,
  };
};

// Create Ad
const createAd = async (adgroup_id: string, video_id: string) => {
  const { identity_id, identity_type } = await getIdentity();

  const url = `${BASE_URL}/ad/create/`;
  const payload = {
    advertiser_id: ADVERTISER_ID,
    adgroup_id,
    creatives: [
      {
        ad_name: "My First API Ad",
        ad_text: "Check this out!",
        ad_format: "SINGLE_VIDEO",
        video_id,
        display_name: "MyBrand",
        identity_id, // ✅ added
        identity_type, // ✅ added
      },
    ],
    operation_status: "DISABLE",
  };

  const res = await axios.post(url, payload, { headers });
  if (res.data.code !== 0)
    throw new Error(`Ad creation failed: ${res.data.message}`);

  console.log("✅ Ad created:", res.data.data);
  return res.data;
};

// Full Flow
export const createFullAdFlow = async (
  videoPath: string,
  imagePath: string
) => {
  try {
    console.log("📦 Starting TikTok ad creation flow");

    // const getAdvertiserInfo = async () => {
    //   const advertiserIdsParam = encodeURIComponent(
    //     JSON.stringify([ADVERTISER_ID])
    //   );
    //   const url = `${BASE_URL}/advertiser/info/?advertiser_ids=${advertiserIdsParam}`;

    //   const res = await axios.get(url, { headers });
    //   console.log(JSON.stringify(res.data, null, 2));
    // };

    // getAdvertiserInfo();

    const video_id = await uploadVideo(videoPath);
    const image_id = await uploadImage(imagePath);
    const campaign_id = await createCampaign();
    const adgroup_id = await createAdGroup(campaign_id);
    const adResult = await createAd(adgroup_id, video_id);

    return { video_id, image_id, campaign_id, adgroup_id, adResult };
  } catch (err: any) {
    console.error("❌ TikTok Ad create error:", err.message);
    throw err;
  }
};

export const createCampaignService = {
  createAdService,
};

11000;
10000;

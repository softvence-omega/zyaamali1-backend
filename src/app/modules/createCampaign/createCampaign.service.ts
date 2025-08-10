const bizSdk = require("facebook-nodejs-business-sdk");
const { FacebookAdsApi, AdAccount, Campaign, AdSet, AdCreative, Ad } = bizSdk;
import FormData from "form-data";
import { googleAdsClient } from "../../utils/googleAdsClient";

import axios from "axios";
import fs from "fs";
import path from "path";

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
  adAccountId: string, // e.g. act_1234567890
  pageId: string,

  imageUrl: string
) => {
  try {
    // 1️⃣ Create Campaign
    const campaignRes = await axios.post(
      `https://graph.facebook.com/v23.0/act_${adAccountId}/campaigns`,
      {
        name: "🚀 My Traffic Campaign",
        objective: "OUTCOME_TRAFFIC", // ✅ new API value
        status: "PAUSED",
        special_ad_categories: [], // ✅ still required
        access_token: accessToken,
      }
    );

    const campaignId = campaignRes.data.id;
    console.log(`✅ Campaign created: ${campaignId}`);

    // 2️⃣ Create Ad Set
    const adSetRes = await axios.post(
      `https://graph.facebook.com/v23.0/act_${adAccountId}/adsets`,
      {
        name: "🚀 Traffic Ad Set",
        campaign_id: campaignId,
        daily_budget: 125000, // ✅ in poisha, so 125.00 BDT
        billing_event: "IMPRESSIONS",
        optimization_goal: "LINK_CLICKS",
        bid_strategy: "LOWEST_COST_WITHOUT_CAP",
        start_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        // end_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        targeting: {
          geo_locations: { countries: ["BD"] },
          age_min: 18,
          age_max: 65,
        },
        status: "PAUSED",
        access_token: accessToken,
      }
    );

    const adSetId = adSetRes.data.id;
    console.log(`✅ Ad Set created: ${adSetId}`);

    // 3️⃣ Create Ad Creative
    const creativeRes = await axios.post(
      `https://graph.facebook.com/v23.0/act_${adAccountId}/adcreatives`,
      {
        name: "Traffic Ad Creative",
        object_story_spec: {
          page_id: pageId,
          link_data: {
            message: "Check out our awesome website!",
            link: "https://adelo.ai",
            image_hash: imageUrl, // from previously uploaded image
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
        name: "My Traffic Ad",
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

  // Upload Image Asset

  const uploadImageAsset = async (
    imageUrl: string,
    type: "LANDSCAPE" | "SQUARE" | "LOGO",
    customer: any
  ) => {
    const timestamp = Date.now();
    const fileName = path.join(
      "/tmp",
      `${type.toLowerCase()}_${timestamp}.jpg`
    );

    // Download image
    const { data } = await axios.get(imageUrl, { responseType: "arraybuffer" });

    // Balanced sizes between min and recommended
    let width: number, height: number;
    if (type === "LANDSCAPE") {
      width = 1000;
      height = 523; // 1.91:1 ratio
    } else if (type === "SQUARE") {
      width = 800;
      height = 800;
    } else {
      width = 512; // Logo
      height = 512;
    }

    // Resize and save
    await sharp(data)
      .resize(width, height, { fit: "cover" })
      .jpeg({ quality: 88 }) // Slightly smaller file size but still high quality
      .toFile(fileName);

    // Create asset in Google Ads
    const assetResult = await customer.assets.create([
      {
        name: `${type}_Asset_${timestamp}`,
        type: "IMAGE",
        image_asset: {
          data: fs.readFileSync(fileName),
        },
      },
    ]);

    const assetName = assetResult.results[0].resource_name;

    const meta = await sharp(fileName).metadata();
    console.log(
      `✅ Uploaded ${type} image (${meta.width}x${meta.height}) → ${assetName}`
    );

    return assetName;
  };

  // Upload Video Asset
  const uploadVideoAsset = async (videoUrl: string) => {
    const asset = await customer.assets.create([
      {
        name: `Video_Asset_${Date.now()}`, // REQUIRED
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
      status: "ENABLED",
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
      status: "ENABLED",
      cpc_bid_micros: cpcBidMicros || 1_000_000,
    },
  ]);
  const adGroupResourceName = adGroup.results[0].resource_name;

  // 4. Ad Creative — switch based on type
  let adPayload: any;
  switch (adType.toUpperCase()) {
    case "SEARCH":
      adPayload = {
        responsive_search_ad: {
          headlines: headlines || [
            { text: "Default Headline 1" },
            { text: "Default Headline 2" },
            { text: "Default Headline 3" },
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
          marketing_images: [{ asset: landscapeAsset }], // Landscape slot
          square_marketing_images: [{ asset: squareAsset }], // Square slot
          logo_images: [{ asset: logoAsset }], // Logo slot
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
      status: "ENABLED",
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

export const createCampaignService = {
  createAdService,
};

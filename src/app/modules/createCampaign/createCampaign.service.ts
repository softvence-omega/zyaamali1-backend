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
  // const validateAspectRatio = (
  //   buffer: Buffer,
  //   expectedRatio: number,
  //   tolerance = 0.01
  // ) => {
  //   const { width, height } = sizeOf(buffer);
  //   const ratio = width / height;
  //   console.log(ratio);
  //   if (Math.abs(ratio - expectedRatio) > tolerance) {
  //     console.warn(
  //       `⚠ Aspect ratio mismatch. Expected ${expectedRatio}, got ${ratio.toFixed(
  //         2
  //       )}. Will resize.`
  //     );
  //     return false;
  //   }
  //   return true;
  // };

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
      targetWidth = 1200;
      targetHeight = 1200; // square logo required (not 512x512)
      expectedRatio = 1.0;
    }

    // const isvalid = validateAspectRatio(data, expectedRatio);
    // console.log('===========================',isvalid)

    // Resize & clean image → buffer
    const processedBuffer = await sharp(data)
      .resize(targetWidth, targetHeight, {
        fit: "cover",
        position: "center",
        withoutEnlargement: true,
      })
      .flatten({ background: "#ffffff" }) // remove transparency
      .jpeg({ quality: 90 })
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

// ====== CONFIG ======
const ACCESS_TOKEN =
  process.env.ACCESS_TOKEN || "f6f28a79c10762e8ffb8e57a6d6e3a40e7c704b7";
const ADVERTISER_ID = process.env.ADVERTISER_ID || "7538282648226054162";
const BASE_URL = "https://business-api.tiktok.com/open_api/v1.3";
const headers = { "Access-Token": ACCESS_TOKEN };

// ====== UTILS ======
const getFileMD5 = (filePath: string) =>
  crypto.createHash("md5").update(fs.readFileSync(filePath)).digest("hex");

const getUTCDateTime = (date = new Date()) =>
  date.toISOString().slice(0, 19).replace("T", " ");

// ====== MAIN FUNCTION ======
export const createTikTokFullAd = async (
  adType: string, // "SINGLE_VIDEO" | "SINGLE_IMAGE" | "SPARK_AD" | "CAROUSEL"
  videoPath?: string, // required for video / spark
  imagePath?: string, // required for image / video thumbnail
  postId?: string, // required for SPARK_AD
  carouselImages?: string[] // required for CAROUSEL
) => {
  try {
    console.log(`📦 Starting TikTok ${adType} ad creation flow`);
    console.log(adType, videoPath, imagePath, postId, carouselImages);

    let video_id: string | undefined;
    let image_id: string | undefined;
    let image_ids: string[] = [];

    // ===== Upload Video if Needed =====
    if (["SINGLE_VIDEO", "SPARK_AD"].includes(adType) && videoPath) {
      const videoForm = new FormData();
      videoForm.append("advertiser_id", ADVERTISER_ID);
      videoForm.append("upload_type", "UPLOAD_BY_FILE");
      videoForm.append("video_signature", getFileMD5(videoPath));
      videoForm.append("video_file", fs.createReadStream(videoPath));

      const videoRes = await axios.post(
        `${BASE_URL}/file/video/ad/upload/`,
        videoForm,
        { headers: { ...headers, ...videoForm.getHeaders() } }
      );

      if (videoRes.data.code !== 0)
        throw new Error(`Video upload failed: ${videoRes.data.message}`);
      video_id = videoRes.data.data[0].video_id;
      console.log("✅ Video uploaded:", video_id);
    }

    // ===== Upload Image if Needed =====
    if (["SINGLE_IMAGE", "SINGLE_VIDEO"].includes(adType) && imagePath) {
      const imageForm = new FormData();
      imageForm.append("advertiser_id", ADVERTISER_ID);
      imageForm.append("upload_type", "UPLOAD_BY_FILE");
      imageForm.append("image_signature", getFileMD5(imagePath));
      imageForm.append("image_file", fs.createReadStream(imagePath));

      const imageRes = await axios.post(
        `${BASE_URL}/file/image/ad/upload/`,
        imageForm,
        { headers: { ...headers, ...imageForm.getHeaders() } }
      );

      if (imageRes.data.code !== 0)
        throw new Error(`Image upload failed: ${imageRes.data.message}`);
      image_id = imageRes.data.data.image_id;
      console.log("✅ Image uploaded:", image_id);
    }

    // ===== Upload Carousel Images if Needed =====
    if (adType === "CAROUSEL" && carouselImages && carouselImages.length > 0) {
      image_ids = [];
      for (const img of carouselImages) {
        const form = new FormData();
        form.append("advertiser_id", ADVERTISER_ID);
        form.append("upload_type", "UPLOAD_BY_FILE");
        form.append("image_signature", getFileMD5(img));
        form.append("image_file", fs.createReadStream(img));

        const res = await axios.post(
          `${BASE_URL}/file/image/ad/upload/`,
          form,
          {
            headers: { ...headers, ...form.getHeaders() },
          }
        );

        if (res.data.code !== 0) {
          throw new Error(`Carousel image upload failed: ${res.data.message}`);
        }

        const imgId = res.data.data.image_id;
        image_ids.push(imgId);
      }
      console.log("✅ Carousel images uploaded:", image_ids);
    }

    // ===== Create Campaign =====
    const campaignRes = await axios.post(
      `${BASE_URL}/campaign/create/`,
      {
        advertiser_id: ADVERTISER_ID,
        campaign_name: `My Campaign ${Date.now()}`,
        objective_type: "TRAFFIC",
        budget_mode: "BUDGET_MODE_DAY",
        budget: 100,
        operation_status: "DISABLE",
      },
      { headers }
    );
    if (campaignRes.data.code !== 0)
      throw new Error(`Campaign creation failed: ${campaignRes.data.message}`);
    const campaign_id = campaignRes.data.data.campaign_id;
    console.log("✅ Campaign created:", campaign_id);

    // ===== Create Ad Group =====
    const adGroupRes = await axios.post(
      `${BASE_URL}/adgroup/create/`,
      {
        advertiser_id: ADVERTISER_ID,
        campaign_id,
        adgroup_name: `AdGroup ${Date.now()}`,
        promotion_type: "WEBSITE",
        placement_type: "PLACEMENT_TYPE_NORMAL",
        placements: ["PLACEMENT_TIKTOK"],
        schedule_type: "SCHEDULE_FROM_NOW",
        schedule_start_time: getUTCDateTime(),
        budget_mode: "BUDGET_MODE_DAY",
        budget: 100,
        billing_event: "CPC",
        optimization_goal: "CLICK",
        bid_type: "BID_TYPE_CUSTOM",
        operation_status: "DISABLE",
        location_ids: ["1210997"],
        bid_price: 2,
      },
      { headers }
    );
    if (adGroupRes.data.code !== 0)
      throw new Error(`Ad group creation failed: ${adGroupRes.data.message}`);
    const adgroup_id = adGroupRes.data.data.adgroup_id;
    console.log("✅ Ad group created:", adgroup_id);

    // ===== Get Identity =====
    const identityRes = await axios.get(
      `${BASE_URL}/identity/get/?advertiser_id=${ADVERTISER_ID}`,
      { headers }
    );
    if (identityRes.data.code !== 0)
      throw new Error(
        `Failed to fetch identities: ${identityRes.data.message}`
      );
    const { identity_id, identity_type } =
      identityRes.data.data.identity_list[0] || {};
    if (!identity_id) throw new Error("No identity found for this advertiser");

    // ===== Switch-case for ad types =====
    let creativePayload: any;
    switch (adType) {
      case "SINGLE_VIDEO":
        creativePayload = {
          ad_format: "SINGLE_VIDEO",
          ad_name: "Video Creative",
          ad_text: "Check this out!",
          call_to_action: "LEARN_MORE",
          landing_page_url: "https://adelo.ai",
          video_id,
          image_ids: [image_id],
          display_name: "MyBrand",
          identity_id,
          identity_type,
        };
        break;

      case "SINGLE_IMAGE":
        console.log("identy id", identity_id);
        console.log("identy type", identity_type);
        creativePayload = {
          ad_format: "SINGLE_IMAGE",
          ad_name: "Image Creative",
          ad_text: "Discover now!",
          call_to_action: "LEARN_MORE",
          landing_page_url: "https://adelo.ai",
          image_ids: [image_id],
          display_name: "MyBrand",
          identity_id,
          identity_type,
        };
        break;

      case "SPARK_AD":
        if (!postId) throw new Error("Spark Ad requires a valid postId");
        creativePayload = {
          ad_format: "SINGLE_VIDEO",
          ad_name: "Spark Ad Creative",
          call_to_action: "LEARN_MORE",
          spark_ad_type: 1,
          promotion_post_id: "7540557690238455047", // ✅ correct field name
          identity_id,
          identity_type,
        };
        break;

      case "CAROUSEL":
        console.log("identy id", identity_id);
        console.log("identy type", identity_type);
        creativePayload = {
          ad_format: "CAROUSEL_ADS", // must be valid
          ad_name: "Carousel Creative",
          ad_text: "Swipe to explore more!",
          call_to_action: "LEARN_MORE",
          landing_page_url: "https://adelo.ai",
          display_name: "MyBrand",
          identity_id,
          identity_type,
          carousel_card_list: image_ids.map((id, idx) => ({
            image_id: id,
            card_name: `Card ${idx + 1}`,
            landing_page_url: "https://adelo.ai",
          })),
        };

        break;

      default:
        throw new Error(`Unsupported ad type: ${adType}`);
    }

    // ===== Create Ad =====
    const adRes = await axios.post(
      `${BASE_URL}/ad/create`,
      {
        advertiser_id: ADVERTISER_ID,
        adgroup_id,
        ad_name: `My API Ad ${Date.now()}`,
        operation_status: "DISABLE",
        creatives: [creativePayload],
      },
      { headers }
    );

    if (adRes.data.code !== 0)
      throw new Error(`Ad creation failed: ${adRes.data.message}`);

    const adId = adRes.data.data?.ad_ids?.[0];
    if (!adId) throw new Error("Ad ID not found in response");

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
  createAdService,
};

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
import { buildDisplayAdPayload, buildSearchAdPayload, buildVideoAdPayload, createAd, createAdGroup, createBudget, createCampaign } from "./createGoogleAdsFunctions/CreateGoogleAds";

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
    let objective = "";
    let optimizationGoal = "";
    let billingEvent = "IMPRESSIONS";
    let creativePayload: any = {};

    // 1️⃣ Map adType → campaign objective + creative
    switch (adType) {
      case "TRAFFIC":
        objective = "OUTCOME_TRAFFIC";
        optimizationGoal = "LINK_CLICKS";
        creativePayload = {
          object_story_spec: {
            page_id: pageId,
            link_data: {
              link,
              message,
              picture: imageUrl || undefined,
              call_to_action: {
                type: callToActionType || "LEARN_MORE",
                value: { link },
              },
            },
          },
        };
        break;

      case "LEAD_GENERATION":
        objective = "LEAD_GENERATION";
        optimizationGoal = "LEAD_GENERATION";
        creativePayload = {
          object_story_spec: {
            page_id: pageId,
            link_data: {
              link,
              message,
              call_to_action: { type: "SIGN_UP", value: { link } },
            },
          },
        };
        break;

      case "VIDEO_VIEWS":
        objective = "OUTCOME_ENGAGEMENT";
        optimizationGoal = "THRUPLAY";
        if (!videoId) {
          throw new Error("VIDEO_VIEWS requires a videoId.");
        }
        creativePayload = {
          object_story_spec: {
            page_id: pageId,
            video_data: {
              video_id: videoId,
              message,
              call_to_action: {
                type: callToActionType || "LEARN_MORE",
                value: { link },
              },
            },
          },
        };
        break;

      case "CONVERSIONS":
        objective = "OUTCOME_SALES";
        optimizationGoal = "OFFSITE_CONVERSIONS";
        creativePayload = {
          object_story_spec: {
            page_id: pageId,
            link_data: {
              link,
              message,
              picture: imageUrl || undefined,
              call_to_action: {
                type: callToActionType || "SHOP_NOW",
                value: { link },
              },
            },
          },
        };
        break;

      case "BRAND_AWARENESS":
        objective = "OUTCOME_AWARENESS";
        optimizationGoal = "REACH";
        creativePayload = {
          object_story_spec: {
            page_id: pageId,
            link_data: {
              link,
              message,
              picture: imageUrl || undefined,
              call_to_action: {
                type: callToActionType || "LEARN_MORE",
                value: { link },
              },
            },
          },
        };
        break;

      case "REACH":
        objective = "OUTCOME_REACH";
        optimizationGoal = "REACH";
        creativePayload = {
          object_story_spec: {
            page_id: pageId,
            link_data: {
              link,
              message,
              picture: imageUrl || undefined,
              call_to_action: {
                type: callToActionType || "LEARN_MORE",
                value: { link },
              },
            },
          },
        };
        break;

      case "ENGAGEMENT":
        objective = "OUTCOME_ENGAGEMENT";
        optimizationGoal = "ENGAGED_USERS";
        creativePayload = {
          object_story_spec: {
            page_id: pageId,
            link_data: {
              link,
              message,
              picture: imageUrl || undefined,
              call_to_action: {
                type: callToActionType || "LIKE_PAGE",
                value: { link },
              },
            },
          },
        };
        break;

      case "APP_INSTALLS":
        objective = "OUTCOME_APP_PROMOTION";
        optimizationGoal = "APP_INSTALLS";
        creativePayload = {
          object_story_spec: {
            page_id: pageId,
            link_data: {
              link,
              message,
              picture: imageUrl || undefined,
              call_to_action: {
                type: callToActionType || "INSTALL_APP",
                value: { link },
              },
            },
          },
        };
        break;

      case "MESSAGES":
        objective = "OUTCOME_MESSAGES";
        optimizationGoal = "MESSAGES";
        creativePayload = {
          object_story_spec: {
            page_id: pageId,
            link_data: {
              link,
              message,
              picture: imageUrl || undefined,
              call_to_action: {
                type: callToActionType || "MESSAGE_PAGE",
                value: { link },
              },
            },
          },
        };
        break;

      default:
        throw new Error(`Unsupported adType: ${adType}`);
    }

    // 2️⃣ Create Campaign
    const campaignRes = await axios.post(
      `https://graph.facebook.com/v23.0/act_${adAccountId}/campaigns`,
      {
        name: campaignName,
        objective,
        status: "PAUSED",
        special_ad_categories: [],
        access_token: accessToken,
      }
    );
    const campaignId = campaignRes.data.id;

    // 3️⃣ Create Ad Set
    const adSetPayload: any = {
      name: adSetName,
      campaign_id: campaignId,
      daily_budget: dailyBudget,
      billing_event: billingEvent,
      optimization_goal: optimizationGoal,
      bid_strategy: "LOWEST_COST_WITHOUT_CAP",
      start_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      targeting: targeting || {
        geo_locations: { countries: ["BD"] },
        age_min: 18,
        age_max: 65,
      },
      status: "PAUSED",
      access_token: accessToken,
    };

    // 👇 add this when adType is CONVERSIONS
    if (adType === "CONVERSIONS") {
      adSetPayload.promoted_object = {
        pixel_id: "1122412253168452", // must be a pixel connected to the ad account
        custom_event_type: "PURCHASE", // or "LEAD", "ADD_TO_CART" etc.
      };
    }

    const adSetRes = await axios.post(
      `https://graph.facebook.com/v23.0/act_${adAccountId}/adsets`,
      adSetPayload
    );

    const adSetId = adSetRes.data.id;

    // 4️⃣ Create Ad Creative
    const creativeRes = await axios.post(
      `https://graph.facebook.com/v23.0/act_${adAccountId}/adcreatives`,
      {
        name: `${adType} Creative`,
        ...creativePayload,
        access_token: accessToken,
      }
    );
    const creativeId = creativeRes.data.id;

    // 5️⃣ Create Ad
    const adRes = await axios.post(
      `https://graph.facebook.com/v23.0/act_${adAccountId}/ads`,
      {
        name: adName,
        adset_id: adSetId,
        creative: { creative_id: creativeId },
        status: "PAUSED",
        access_token: accessToken,
      }
    );

    // ✅ Success response
    return {
      success: true,
      message: `${adType} ad created successfully`,
      data: {
        campaignId,
        adSetId,
        creativeId,
        adId: adRes.data.id,
      },
    };
  } catch (err: any) {
    console.error("❌ Error creating ad:", err.response.data || err.message);
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
  createFacebookAdService,
  createLinkedInAd,
};

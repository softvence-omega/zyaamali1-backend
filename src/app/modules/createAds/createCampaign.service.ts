const bizSdk = require("facebook-nodejs-business-sdk");
import { googleAdsClient } from "../../utils/googleAdsClient";

import axios from "axios";
import { liAxios } from "../../utils/getLinkedinCampaignId";
import {
  buildDisplayAdPayload,
  buildSearchAdPayload,
  buildVideoAdPayload,
  createAd,
  createAdGroup,
  createBudget,
  createCampaign,
} from "./adsUtils/CreateGoogleAdsFunction";
import {
  buildFacebookAdObjectiveAndCreative,
  createFacebookAd,
  createFacebookAdCreative,
  createFacebookAdSet,
  createFacebookCampaign,
} from "./adsUtils/createFacebookAdsFunction";
import {
  buildCreativePayload,
  createTiktokAd,
  createTiktokAdGroup,
  createTiktokCampaign,
  getIdentity,
  uploadCarouselImages,
  uploadImage,
  uploadVideo,
} from "./adsUtils/createTiktokAdsFunction";

// facebook

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

export const createAdsFacebookAdService = async (
  accessToken: string,
  adAccountId: string,
  pageId: string,
  application_id: any,
  adType: string,
  campaignName: string,
  adSetName: string,
  adName: string,
  dailyBudget: string,
  targeting: any,
  link: string,
  message: string,
  callToActionType: string,
  imageUrl: string | undefined,
  videoId: string | undefined
) => {
  try {
    console.log(adType, "from service");
    console.log(campaignName, "campaign from service ");
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
      pageId,
      link,
      application_id,
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

  try {
    const customer = googleAdsClient.Customer({
      customer_id: customerId,
      refresh_token: refreshToken,
    });

    // Step 1: Campaign Setup
    let budgetResourceName, campaignResourceName, adGroupResourceName;
    try {
      budgetResourceName = await createBudget(customer, budgetAmountMicros);
    } catch (err: any) {
      console.error("❌ Failed to create budget:", err);
      throw new Error(
        `Budget creation failed: ${err.message || JSON.stringify(err)}`
      );
    }

    try {
      campaignResourceName = await createCampaign(
        customer,
        budgetResourceName,
        adType,
        campaignName
      );
    } catch (err: any) {
      console.error("❌ Failed to create campaign:", err);
      throw new Error(
        `Campaign creation failed: ${err.message || JSON.stringify(err)}`
      );
    }

    try {
      adGroupResourceName = await createAdGroup(
        customer,
        campaignResourceName,
        adGroupName,
        cpcBidMicros
      );
    } catch (err: any) {
      console.error("❌ Failed to create ad group:", err);
      throw new Error(
        `Ad group creation failed: ${err.message || JSON.stringify(err)}`
      );
    }

    // Step 2: Build Ad Payload
    let adPayload;
    try {
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
    } catch (err: any) {
      console.error("❌ Failed to build ad payload:", err);
      throw new Error(
        `Ad payload build failed: ${err.message || JSON.stringify(err)}`
      );
    }

    // Step 3: Final Ad Creation
    try {
      return await createAd(
        customer,
        adGroupResourceName,
        adPayload,
        adType,
        containsEuPoliticalAdvertising
      );
    } catch (err: any) {
      throw new Error(
        `Ad creation failed: ${err.message || JSON.stringify(err)}`
      );
    }
  } catch (err: any) {
    console.error("❌ createGoogleAdService fatal error:", err);
    throw new Error(
      `createGoogleAdService failed: ${err.message || JSON.stringify(err)}`
    );
  }
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

export const createLinkedInTextAd = async ({
  accessToken,
  advertiserId,
  campaignName,
  creativeText,
  landingPageUrl,
}: LinkedInAdInput) => {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    // "X-Restli-Protocol-Version": "2.0.0",
    "Content-Type": "application/json",
  };

  // ✅ Create Campaign Group
  const now = Date.now();
  // const groupRes = await axios.post(
  //   "https://api.linkedin.com/v2/adCampaignGroupsV2",
  //   {
  //     account: `urn:li:sponsoredAccount:${advertiserId}`,
  //     name: `My Campaign Group ${now}`, // avoid duplicates
  //     status: "ACTIVE",
  //     runSchedule: {
  //       start: now, // Long, not string
  //       end: now + 30 * 24 * 60 * 60 * 1000, // 30 days from now
  //     },
  //   },
  //   { headers }
  // );

  // console.log("Campaign Group Raw Response:", groupRes.data);

  // const campaignGroupUrn = groupRes.data.id
  //   ? `urn:li:sponsoredCampaignGroup:${groupRes.data.id}`
  //   : null;

  const campaignGroupUrn = "urn:li:sponsoredCampaignGroup:773830404";

  if (!campaignGroupUrn) {
    throw new Error("Failed to create campaign group or retrieve URN");
  }

  console.log("Campaign Group URN:", campaignGroupUrn);

  // ✅ Create Campaign
  const micros = (amount: number) => amount * 1_000_000;


const campaignRes = await axios.post(
  "https://api.linkedin.com/v2/adCampaignsV2",
  {
    account: `urn:li:sponsoredAccount:${advertiserId}`,
    campaignGroup: campaignGroupUrn,
    name: campaignName,
    dailyBudget: { amount: 1000, currencyCode: "USD" }, // number
    type: "TEXT_AD",
    status: "ACTIVE",
    locale: "en_US",
    runSchedule: {
      start: Date.now() + 60 * 1000,  // start 1 min from now
      end: Date.now() + 7 * 24 * 60 * 60 * 1000,
    },
  },
  { headers }
);



  console.log("Campaign Creation Response:", campaignRes.data);

  const campaignId = campaignRes.data.id;
  if (!campaignId) throw new Error("Failed to create campaign");

  // ✅ Create Text Ad Creative
  const creativeRes = await axios.post(
    "https://api.linkedin.com/v2/adCreativesV2",
    {
      campaign: `urn:li:sponsoredCampaign:${campaignId}`,
      type: "TEXT_AD",
      variables: {
        textAd: {
          headline: creativeText,
          landingPageUrl,
          description: "This is a sample text ad created via API",
        },
      },
    },
    { headers }
  );

  const creativeId = creativeRes.data.id;

  return {
    campaignId,
    creativeId,
    creative: creativeRes.data,
  };
};

// TikTok
export const createTikTokFullAd = async (
  adType: string,
  videoPath?: string,
  imagePath?: string,
  postId?: string,
  carouselImages?: string[],
  options?: {
    campaign_name?: string;
    adgroup_name?: string;
    ad_name?: string;
    ad_text?: string;
    call_to_action?: string;
    landing_page_url?: string;
    budget?: number;
    bid_price?: number;
    objective_type?: string;
    promotion_type?: string;
    location_ids?: string[];
  }
) => {
  console.log("ads objectivbe ", options?.objective_type);

  try {
    console.log(`📦 Starting TikTok ${adType} ad creation flow`);

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

    // Campaign & AdGroup with dynamic values
    const campaign_id = await createTiktokCampaign(
      options?.objective_type as any,
      options?.campaign_name,
      options?.budget
    );

    const adgroup_id = await createTiktokAdGroup(
      campaign_id,
      options?.adgroup_name,
      options?.promotion_type,
      options?.budget,
      options?.bid_price,
      options?.location_ids
    );

    const identity = await getIdentity();

    const creativePayload = buildCreativePayload(
      adType,
      { video_id, image_id, image_ids },
      identity,
      postId,
      options
    );

    const adId = await createTiktokAd(
      adgroup_id,
      creativePayload,
      adType,
      options?.ad_name
    );

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
  createAdsFacebookAdService,
  createLinkedInTextAd,
};

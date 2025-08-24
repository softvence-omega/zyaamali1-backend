// ==========================
// 1️⃣ Objective + Creative Builder
// ==========================
import axios from "axios";

export const buildFacebookAdObjectiveAndCreative = (
  adType: string,
  pageId: string,
  link: string,
  message: string,
  callToActionType: string,
  imageUrl?: string,
  videoId?: string
) => {
  let objective = "";
  let optimizationGoal = "";
  let billingEvent = "IMPRESSIONS";
  let creativePayload: any = {};

  try {
    switch (adType) {
      case "TRAFFIC":
        objective = "OUTCOME_TRAFFIC";
        optimizationGoal = "LINK_CLICKS";
        billingEvent = "IMPRESSIONS";
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
        billingEvent = "IMPRESSIONS";
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
        if (!videoId) throw new Error("VIDEO_VIEWS requires a videoId.");
        objective = "OUTCOME_AWARENESS"; // ✅ correct ODAX pairing
        optimizationGoal = "THRUPLAY"; // ✅ now valid
        billingEvent = "IMPRESSIONS";
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
              image_url: imageUrl || "https://your-default-thumbnail.jpg",
            },
          },
        };
        break;

      case "CONVERSIONS":
        objective = "OUTCOME_SALES";
        optimizationGoal = "OFFSITE_CONVERSIONS"; // ✅ must be CONVERSIONS
        billingEvent = "IMPRESSIONS";
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
        optimizationGoal = "AD_RECALL_LIFT"; // ✅ correct
        billingEvent = "IMPRESSIONS";
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
        optimizationGoal = "REACH"; // ✅ correct
        billingEvent = "IMPRESSIONS";
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
        optimizationGoal = "POST_ENGAGEMENT"; // ✅ correct
        billingEvent = "IMPRESSIONS";
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
        optimizationGoal = "APP_INSTALLS"; // ✅ correct
        billingEvent = "IMPRESSIONS";
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
        optimizationGoal = "MESSAGES"; // ✅ correct
        billingEvent = "IMPRESSIONS";
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
  } catch (error: any) {
    console.error(
      "❌ Error in buildFacebookAdObjectiveAndCreative:",
      error.message
    );
    throw error;
  }

  return { objective, optimizationGoal, billingEvent, creativePayload };
};

// ==========================
// 2️⃣ Campaign
// ==========================
export const createFacebookCampaign = async (
  adAccountId: string,
  campaignName: string,
  objective: string,
  accessToken: string
) => {
  console.log("campaign", objective);
  try {
    const res = await axios.post(
      `https://graph.facebook.com/v23.0/act_${adAccountId}/campaigns`,
      {
        name: campaignName,
        objective,
        status: "PAUSED",
        special_ad_categories: [],
        access_token: accessToken,
      }
    );
    console.log("Facebook campaign created ", res.data);
    return res.data.id;
  } catch (error: any) {
    console.error(
      "❌ Failed to create campaign:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ==========================
// 3️⃣ Ad Set
// ==========================
export const createFacebookAdSet = async (
  adAccountId: string,
  pageId: any,
  adSetName: string,
  campaignId: string,
  dailyBudget: string,
  billingEvent: string,
  optimizationGoal: string,
  accessToken: string,
  targeting: any,
  adType: string
) => {
  try {
    console.log(optimizationGoal, campaignId, "ad set -----------------");
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

    // Only add promoted_object where required
    if (adType === "CONVERSIONS") {
      adSetPayload.promoted_object = {
        pixel_id: "1122412253168452", // ⚠️ replace with your real pixel
        custom_event_type: "PURCHASE",
      };
    }

    if (adType === "VIDEO_VIEWS") {
      adSetPayload.promoted_object = {
        page_id: pageId,
      };
    }

    // console.log("Final AdSet Payload:", JSON.stringify(adSetPayload, null, 2));

    const res = await axios.post(
      `https://graph.facebook.com/v23.0/act_${adAccountId}/adsets`,
      adSetPayload
    );
    console.log("Facebook Ad Set created ", res.data);

    return res.data.id;
  } catch (error: any) {
    console.error(
      "❌ Failed to create ad set:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ==========================
// 4️⃣ Ad Creative
// ==========================
export const createFacebookAdCreative = async (
  adAccountId: string,
  adType: string,
  creativePayload: any,
  accessToken: string
) => {
  try {
    const res = await axios.post(
      `https://graph.facebook.com/v23.0/act_${adAccountId}/adcreatives`,
      {
        name: `${adType} Creative`,
        object_story_spec: JSON.stringify(creativePayload.object_story_spec),
        access_token: accessToken,
      }
    );
    console.log("facebook  creative created ", res.data);
    return res.data.id;
  } catch (error: any) {
    console.error(
      "❌ Failed to create ad creative:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ==========================
// 5️⃣ Ad
// ==========================
export const createFacebookAd = async (
  adAccountId: string,
  adName: string,
  adSetId: string,
  creativeId: string,
  accessToken: string
) => {
  try {
    const res = await axios.post(
      `https://graph.facebook.com/v23.0/act_${adAccountId}/ads`,
      {
        name: adName,
        adset_id: adSetId,
        creative: { creative_id: creativeId },
        status: "PAUSED",
        access_token: accessToken,
      }
    );
    console.log(" facebook ads created", res.data);
    return res.data.id;
  } catch (error: any) {
    console.error(
      "❌ Failed to create ad:",
      error.response?.data || error.message
    );
    throw error;
  }
};

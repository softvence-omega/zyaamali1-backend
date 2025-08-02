import axios from "axios";
const bizSdk = require("facebook-nodejs-business-sdk");
const { FacebookAdsApi, AdAccount, Campaign, AdSet, AdCreative, Ad } = bizSdk;
import FormData from "form-data";
import { googleAdsClient } from "../../utils/googleAdsClient";

// facebook
const uploadImageService = async (
  accessToken: string,
  adAccountId: string,
  imageUrl: string
): Promise<string> => {
  const endpoint = `https://graph.facebook.com/v19.0/act_${adAccountId}/adimages`;

  const form = new FormData();
  form.append("url", imageUrl);

  const response = await axios.post(endpoint, form, {
    headers: {
      ...form.getHeaders(),
    },
    params: {
      access_token: accessToken,
    },
  });

  const images = response.data.images;
  const imageHash = (Object as any).values(images)[0].hash;
  return imageHash;
};

const createAdService = async (
  accessToken: string,
  adAccountId: string,
  pageId: string,
  imageHash: string
) => {
  FacebookAdsApi.init(accessToken);

  // 1. Campaign
  const campaign = await new AdAccount(adAccountId).createCampaign([], {
    name: "🚫 Safe Test Campaign",
    objective: "LINK_CLICKS",
    status: "PAUSED",
    special_ad_categories: [],
  });

  // 2. Ad Set
  const adSet = await new AdAccount(adAccountId).createAdSet([], {
    name: "🚫 Safe Test Ad Set",
    campaign_id: campaign.id,
    daily_budget: 1000,
    billing_event: "IMPRESSIONS",
    optimization_goal: "LINK_CLICKS",
    targeting: {
      geo_locations: { countries: ["US"] },
    },
    start_time: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: "PAUSED",
  });

  // 3. Creative
  const creative = await new AdAccount(adAccountId).createAdCreative([], {
    name: "Test Creative",
    object_story_spec: {
      page_id: pageId,
      link_data: {
        message: "🚀 This is a safe test ad (paused)",
        link: "https://your-landing-page.com",
        image_hash: imageHash,
      },
    },
  });

  // 4. Ad
  const ad = await new AdAccount(adAccountId).createAd([], {
    name: "🚫 Safe Test Ad",
    adset_id: adSet.id,
    creative: { creative_id: creative.id },
    status: "PAUSED",
  });

  return {
    campaignId: campaign.id,
    adSetId: adSet.id,
    creativeId: creative.id,
    adId: ad.id,
  };
};

// google

export const createGoogleAdService = async ({
  customerId,
  refreshToken,
  finalUrl,
}: {
  customerId: string;
  refreshToken: string;
  finalUrl: string;
}) => {
  const customer = googleAdsClient.Customer({
    customer_id: customerId,
    refresh_token: refreshToken,
  });

  // 1. Create Campaign Budget
  const budget = await customer.campaignBudgets.create([
    {
      name: `Budget_${Date.now()}`,
      amount_micros: 50000000, // $50
      delivery_method: "STANDARD",
    },
  ]);
  const budgetResourceName = budget.results[0].resource_name;

  // 2. Create Campaign
  const campaign = await customer.campaigns.create([
    {
      name: `Campaign_${Date.now()}`,
      advertising_channel_type: "SEARCH",
      status: "PAUSED",
      manual_cpc: {},
      campaign_budget: budgetResourceName,
    },
  ]);
  const campaignResourceName = campaign.results[0].resource_name;

  // 3. Create Ad Group
  const adGroup = await customer.adGroups.create([
    {
      name: `AdGroup_${Date.now()}`,
      campaign: campaignResourceName,
      status: "ENABLED",
      cpc_bid_micros: 1000000,
    },
  ]);
  const adGroupResourceName = adGroup.results[0].resource_name;

  // 4. Create Ad
  const ad = await customer.adGroupAds.create([
    {
      ad_group: adGroupResourceName,
      status: "ENABLED",
      ad: {
        responsive_search_ad: {
          headlines: [{ text: "Your Headline" }, { text: "Another Headline" }],
          descriptions: [{ text: "Your Description" }],
        },
        final_urls: [finalUrl],
      },
    },
  ]);

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
  uploadImageService,
  createAdService,
};

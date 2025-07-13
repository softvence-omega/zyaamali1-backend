// services/tiktokService.ts
import axios from "axios";
import { config } from "dotenv";
config();

const TIKTOK_BASE_URL = "https://business-api.tiktok.com/open_api/v1.3";
const ACCESS_TOKEN = process.env.TIKTOK_ACCESS_TOKEN; // store securely
const ADVERTISER_ID = process.env.TIKTOK_ADVERTISER_ID;

const headers = {
  "Access-Token": ACCESS_TOKEN,
  "Content-Type": "application/json",
};

// Create TikTok Campaign
export const createTikTokCampaign = async (name: string, objective: string, budget: number) => {
  const payload = {
    advertiser_id: ADVERTISER_ID,
    campaign_name: name,
    objective_type: objective.toUpperCase(), // e.g., TRAFFIC, CONVERSIONS
    budget_mode: "BUDGET_MODE_INFINITE",
    campaign_budget: budget,
  };

  const response = await axios.post(`${TIKTOK_BASE_URL}/campaign/create/`, payload, { headers });
  return response.data;
};

// Create TikTok Ad Group (Ad Set)
export const createTikTokAdGroup = async (
  campaignId: string,
  adSetName: string,
  schedule: { start: number; end: number },
  targeting: any,
  budget: number
) => {
  const payload = {
    advertiser_id: ADVERTISER_ID,
    campaign_id: campaignId,
    adgroup_name: adSetName,
    schedule_type: "SCHEDULE_FROM_NOW",
    start_time: schedule.start,
    end_time: schedule.end,
    placement_type: "PLACEMENT_TYPE_AUTO",
    targeting,
    budget_mode: "BUDGET_MODE_DAY",
    budget,
    billing_event: "BILLINGEVENT_IMPRESSION",
    optimization_goal: "REACH",
    bid: 100, // Example bid amount (in cents)
  };

  const response = await axios.post(`${TIKTOK_BASE_URL}/adgroup/create/`, payload, { headers });
  return response.data;
};

// Create TikTok Ad
export const createTikTokAd = async (
  adGroupId: string,
  adName: string,
  creativeId: string
) => {
  const payload = {
    advertiser_id: ADVERTISER_ID,
    adgroup_id: adGroupId,
    ad_name: adName,
    creative_material_mode: "UNIFIED_CREATIVE",
    creative_list: [{ creative_id: creativeId }],
  };

  const response = await axios.post(`${TIKTOK_BASE_URL}/ad/create/`, payload, { headers });
  return response.data;
};

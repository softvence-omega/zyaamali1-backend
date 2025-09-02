import axios from "axios";
import fs from "fs";
import crypto from "crypto";
import FormData from "form-data";

const ACCESS_TOKEN =
  process.env.ACCESS_TOKEN || "f6f28a79c10762e8ffb8e57a6d6e3a40e7c704b7";
const ADVERTISER_ID = process.env.ADVERTISER_ID || "7538282648226054162";
const BASE_URL = "https://business-api.tiktok.com/open_api/v1.3";
const headers = { "Access-Token": ACCESS_TOKEN };

// ========================= UTILS =========================
export const getFileMD5 = (filePath: string) =>
  crypto.createHash("md5").update(fs.readFileSync(filePath)).digest("hex");

export const getUTCDateTime = (date = new Date()) =>
  date.toISOString().slice(0, 19).replace("T", " ");

// ========================= FILE UPLOAD HELPERS =========================
export const uploadVideo = async (videoPath: string) => {
  try {
    const form = new FormData();
    form.append("advertiser_id", ADVERTISER_ID);
    form.append("upload_type", "UPLOAD_BY_FILE");
    form.append("video_signature", getFileMD5(videoPath));
    form.append("video_file", fs.createReadStream(videoPath));

    const res = await axios.post(`${BASE_URL}/file/video/ad/upload/`, form, {
      headers: { ...headers, ...form.getHeaders() },
    });

    if (res.data.code !== 0) {
      console.error("❌ Video upload error:", res.data);
      throw new Error(`Video upload failed: ${res.data.message}`);
    }

    return res.data.data[0].video_id;
  } catch (error: any) {
    console.error(
      "❌ Failed to upload video:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const uploadImage = async (imagePath: string) => {
  try {
    const form = new FormData();
    form.append("advertiser_id", ADVERTISER_ID);
    form.append("upload_type", "UPLOAD_BY_FILE");
    form.append("image_signature", getFileMD5(imagePath));
    form.append("image_file", fs.createReadStream(imagePath));

    const res = await axios.post(`${BASE_URL}/file/image/ad/upload/`, form, {
      headers: { ...headers, ...form.getHeaders() },
    });

    if (res.data.code !== 0) {
      console.error("❌ Image upload error:", res.data);
      throw new Error(`Image upload failed: ${res.data.message}`);
    }

    console.log("✅ Uploaded image_id:", res.data.data.image_id);

    return res.data.data.image_id;
  } catch (error: any) {
    console.error(
      "❌ Failed to upload image:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const uploadCarouselImages = async (images: string[]) => {
  const ids: string[] = [];
  for (const img of images) {
    try {
      ids.push(await uploadImage(img));
    } catch (error) {
      console.error(`❌ Failed to upload carousel image (${img}):`, error);
      throw error;
    }
  }
  return ids;
};

// ========================= CAMPAIGN / ADGROUP =========================
export const createTiktokCampaign = async (
  objective: "TRAFFIC" | "CONVERSIONS" = "TRAFFIC"
) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/campaign/create/`,
      {
        advertiser_id: ADVERTISER_ID,
        campaign_name: `Traffic Campaign ${Date.now()}`,
        objective_type: objective, // TRAFFIC for Website Clicks
        budget_mode: "BUDGET_MODE_DAY",
        budget: 100,
        operation_status: "DISABLE",
      },
      { headers }
    );

    if (res.data.code !== 0) {
      console.error("❌ Campaign creation error:", res.data);
      throw new Error(`Campaign creation failed: ${res.data.message}`);
    }

    return res.data.data.campaign_id;
  } catch (error: any) {
    console.error(
      "❌ Failed to create campaign:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const createTiktokAdGroup = async (campaign_id: string) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/adgroup/create/`,
      {
        advertiser_id: ADVERTISER_ID,
        campaign_id,
        adgroup_name: `Traffic AdGroup ${Date.now()}`,
        promotion_type: "WEBSITE", // Website Clicks
        placement_type: "PLACEMENT_TYPE_NORMAL",
        placements: ["PLACEMENT_TIKTOK"],
        schedule_type: "SCHEDULE_FROM_NOW",
        schedule_start_time: getUTCDateTime(),
        budget_mode: "BUDGET_MODE_DAY",
        budget: 100,
        billing_event: "CPC", // Pay per click
        optimization_goal: "CLICK", // Optimize for website clicks
        bid_type: "BID_TYPE_CUSTOM",
        operation_status: "DISABLE",
        location_ids: ["1210997"], // Country/location targeting
        bid_price: 2,
      },
      { headers }
    );

    if (res.data.code !== 0) {
      console.error("❌ Ad group creation error:", res.data);
      throw new Error(`Ad group creation failed: ${res.data.message}`);
    }

    return res.data.data.adgroup_id;
  } catch (error: any) {
    console.error(
      "❌ Failed to create ad group:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ========================= IDENTITY =========================
export const getIdentity = async () => {
  try {
    const res = await axios.get(
      `${BASE_URL}/identity/get/?advertiser_id=${ADVERTISER_ID}`,
      { headers }
    );

    if (res.data.code !== 0) {
      console.error("❌ Identity fetch error:", res.data);
      throw new Error(`Failed to fetch identities: ${res.data.message}`);
    }

    const { identity_id, identity_type } = res.data.data.identity_list[0] || {};
    if (!identity_id) throw new Error("No identity found for this advertiser");

    return { identity_id, identity_type };
  } catch (error: any) {
    console.error(
      "❌ Failed to get identity:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ========================= CREATIVE PAYLOAD BUILDER =========================
export const buildCreativePayload = (
  adType: string,
  ids: { video_id?: string; image_id?: string; image_ids?: string[] },
  identity: { identity_id: string; identity_type: string },
  postId?: string
) => {
  try {
    switch (adType) {
      case "SINGLE_VIDEO":
        return {
          ad_format: "SINGLE_VIDEO",
          ad_name: "Video Traffic Ad",
          ad_text: "Check this out!",
          call_to_action: "LEARN_MORE",
          landing_page_url: "https://adelo.ai",
          video_id: ids.video_id,
          image_ids: [ids.image_id],
          display_name: "MyBrand",
          ...identity,
        };

      case "SPARK_AD":
        return {
          ad_format: "SINGLE_VIDEO",
          ad_name: "Spark Post Traffic Ad",
          ad_text: "Check this out!",
          call_to_action: "LEARN_MORE",
          landing_page_url: "https://adelo.ai",
          post_id: postId,
          display_name: "MyBrand",
          ...identity,
        };

      case "SINGLE_IMAGE":
        return {
          ad_format: "SINGLE_IMAGE",
          ad_name: "Image Traffic Ad",
          ad_text: "Discover now!",
          call_to_action: "LEARN_MORE",
          landing_page_url: "https://adelo.ai",
          image_ids: [ids.image_id],
          display_name: "MyBrand",
          ...identity,
        };

      case "CAROUSEL":
        return {
          ad_format: "CAROUSEL_ADS",
          ad_name: "Carousel Traffic Ad",
          ad_text: "Swipe to explore!",
          call_to_action: "LEARN_MORE",
          landing_page_url: "https://adelo.ai",
          display_name: "MyBrand",
          ...identity,
          carousel_card_list: ids.image_ids?.map((id, idx) => ({
            image_id: id,
            card_name: `Card ${idx + 1}`,
            landing_page_url: "https://adelo.ai",
          })),
        };

      default:
        throw new Error(`Unsupported ad type: ${adType}`);
    }
  } catch (error: any) {
    console.error("❌ Error building creative payload:", error.message);
    throw error;
  }
};

// ========================= CREATE AD =========================
export const createTiktokAd = async (
  adgroup_id: string,
  creativePayload: any,
  adType: string
) => {
  try {
    const res = await axios.post(
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

    if (res.data.code !== 0) {
      console.error("❌ Ad creation error:", res.data);
      throw new Error(`Ad creation failed: ${res.data.message}`);
    }

    return res.data.data.ad_ids[0];
  } catch (error: any) {
    console.error(
      "❌ Failed to create ad:",
      error.response?.data || error.message
    );
    throw error;
  }
};

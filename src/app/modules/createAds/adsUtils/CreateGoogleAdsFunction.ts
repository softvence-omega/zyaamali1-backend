import axios from "axios";
import sharp from "sharp";

// ==========================
// 1️⃣ Utilities
// ==========================
export const loadImage = async (filePath: string) => {
  try {
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      const response = await axios.get(filePath, {
        responseType: "arraybuffer",
      });
      return Buffer.from(response.data);
    }
    return filePath;
  } catch (err: any) {
    throw new Error(`❌ Failed to load image from ${filePath}: ${err.message}`);
  }
};

// Validate image ratio
export const validateImageRatio = async (
  filePath: string,
  expectedRatio: number,
  label: string
) => {
  try {
    const input = await loadImage(filePath);
    const metadata = await sharp(input).metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    if (!width || !height) {
      throw new Error(`❌ Unable to read dimensions of ${label}`);
    }

    const actualRatio = parseFloat((width / height).toFixed(2));
    console.log(width,height)
    console.log(actualRatio)

    if (actualRatio !== expectedRatio) {
      throw new Error(
        `${label} must have ratio ${expectedRatio}, but got ${actualRatio} (${width}x${height})`
      );
    }
    return true;
  } catch (err: any) {
    throw new Error(
      `❌ Image ratio validation failed for ${label}: ${err.message}`
    );
  }
};

// Extract YouTube Video ID

export const getYouTubeId = (url: string) => {
  try {
    if (url.includes("youtube.com"))
      return new URL(url).searchParams.get("v") || "";
    if (url.includes("youtu.be"))
      return url.split("/").pop()?.split("?")[0] || "";
    return url;
  } catch {
    return "";
  }
};

// ==========================
// 2️⃣ Asset Uploaders
// ==========================

// Upload Image Asset

export const uploadImageAsset = async (
  customer: any,
  imageUrl: string,
  type: "LANDSCAPE" | "SQUARE" | "LOGO_SQUARE" | "LOGO_WIDE"
) => {
  try {
    const { data } = await axios.get(imageUrl, { responseType: "arraybuffer" });
 
    const timestamp = Date.now();

    // validate aspect ratio
    const metadata = await sharp(data).metadata();
  
    if (!metadata.width || !metadata.height) {
      throw new Error("Could not determine image dimensions.");
    }

    const aspectRatio = metadata.width / metadata.height;
    console.log(aspectRatio,'------------------------------------------')

    switch (type) {
      case "LANDSCAPE":
        if (Math.abs(aspectRatio - 1.91) > 0.01) {
          throw new Error("LANDSCAPE images must be 1.91:1 (e.g., 1200x628).");
        }
        break;

      case "SQUARE":
      case "LOGO_SQUARE":
        if (metadata.width !== metadata.height) {
          throw new Error(
            "SQUARE/LOGO_SQUARE images must be 1:1 (e.g., 1200x1200)."
          );
        }
        break;

      case "LOGO_WIDE":
        if (Math.abs(aspectRatio - 4.0) > 0.01) {
          throw new Error("LOGO_WIDE images must be 4:1 (e.g., 1200x300).");
        }
        break;
    }

    const assetResult = await customer.assets.create([
      {
        name: `${type}_Asset_${timestamp}`,
        type: "IMAGE",
        image_asset: { data },
      },
    ]);

    return assetResult.results[0].resource_name;
  } catch (err: any) {
    console.error("❌ Upload failed:", err);
    return err;
  }
};

// Upload Video Asset
export const uploadVideoAsset = async (customer: any, videoUrl: string) => {
  try {
    const youtubeId = getYouTubeId(videoUrl);
    if (!youtubeId) throw new Error("Invalid YouTube URL or missing video ID");

    const asset = await customer.assets.create([
      {
        name: `Video_Asset_${Date.now()}`,
        type: "YOUTUBE_VIDEO",
        youtube_video_asset: { youtube_video_id: youtubeId },
      },
    ]);

    return asset.results[0].resource_name;
  } catch (err: any) {
    throw new Error(`❌ Failed to upload video asset: ${err.message}`);
  }
};

// ==========================
// 3️⃣ Campaign Setup
// ==========================
export const createBudget = async (customer: any, amountMicros: number) => {
  try {
    const budget = await customer.campaignBudgets.create([
      {
        name: `Budget_${Date.now()}`,
        amount_micros: amountMicros || 2_500_000,
        delivery_method: "STANDARD",
      },
    ]);

    return budget.results[0].resource_name;
  } catch (err: any) {
    throw new Error(`❌ Failed to create budget: ${err.message}`);
  }
};

export const createCampaign = async (
  customer: any,
  budgetResourceName: string,
  adType: string,
  campaignName: string
) => {
  try {
    const channelType =
      adType.toUpperCase() === "VIDEO" ? "VIDEO_ACTION" : adType.toUpperCase();

    const campaign = await customer.campaigns.create([
      {
        name: `${campaignName || "Campaign"}_${Date.now()}`,
        advertising_channel_type: channelType,
        status: "PAUSED",
        manual_cpc: {},
        campaign_budget: budgetResourceName,
      },
    ]);
    console.log("facebook campaign created", campaign.results[0]);
    return campaign.results[0].resource_name;
  } catch (err: any) {
    throw new Error(`❌ Failed to create campaign: ${err.message}`);
  }
};

export const createAdGroup = async (
  customer: any,
  campaignResourceName: string,
  adGroupName: string,
  cpcBidMicros: number
) => {
  try {
    const adGroup = await customer.adGroups.create([
      {
        name: adGroupName || `AdGroup_${Date.now()}`,
        campaign: campaignResourceName,
        status: "PAUSED",
        cpc_bid_micros: cpcBidMicros || 1_000_000,
      },
    ]);
    console.log("facebook ad group created", adGroup.results);
    return adGroup.results[0].resource_name;
  } catch (err: any) {
    throw new Error(`❌ Failed to create ad group: ${err.message}`);
  }
};

// ==========================
// 4️⃣ Ad Payload Builders
// ==========================
export const buildSearchAdPayload = (
  headlines: any[],
  descriptions: any[],
  finalUrl: string
) => {
  return {
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
};

export const buildDisplayAdPayload = async (
  customer: any,
  images: any,
  headlines: any[],
  descriptions: any[],
  longHeadline: any,
  businessName: string,
  finalUrl: string
) => {
  try {
    if (!images?.landscape || !images?.square || !images?.logo_square) {
      throw new Error(
        "Landscape, square, and logo_square images are required for DISPLAY ads"
      );
    }

    await validateImageRatio(images.landscape, 1.91, "Landscape image");
    await validateImageRatio(images.square, 1, "Square image");
    await validateImageRatio(images.logo_square, 1, "Square Logo");
    if (images.logo_wide)
      await validateImageRatio(images.logo_wide, 4, "Wide Logo");

    const landscapeAsset = await uploadImageAsset(
      customer,
      images.landscape,
      "LANDSCAPE"
    );
    const squareAsset = await uploadImageAsset(
      customer,
      images.square,
      "SQUARE"
    );
    const squareLogoAsset = await uploadImageAsset(
      customer,
      images.logo_square,
      "LOGO_SQUARE"
    );
    console.log('logo square', squareLogoAsset)

    return {
      responsive_display_ad: {
        headlines,
        long_headline: longHeadline || { text: "Default Long Headline" },
        descriptions,
        business_name: businessName || "Your Business Name",
        marketing_images: [{ asset: landscapeAsset }],
        square_marketing_images: [{ asset: squareAsset }],
        logo_images: [{ asset: squareLogoAsset }],
      },
      final_urls: [finalUrl],
    };
  } catch (err: any) {
    throw new Error(`❌ Failed to build display ad payload: ${err.message}`);
  }
};

export const buildVideoAdPayload = async (
  customer: any,
  videoUrl: string,
  headlines: any[],
  descriptions: any[],
  finalUrl: string
) => {
  try {
    if (!videoUrl) throw new Error("Video URL is required for VIDEO ads");

    const videoAsset = await uploadVideoAsset(customer, videoUrl);

    return {
      responsive_video_ad: {
        videos: [{ asset: videoAsset }],
        headlines: headlines || [{ text: "Default Headline" }],
        descriptions: descriptions || [{ text: "Default Description" }],
      },
      final_urls: [finalUrl],
    };
  } catch (err: any) {
    throw new Error(`❌ Failed to build video ad payload: ${err.message}`);
  }
};

// ==========================
// 5️⃣ Final Ad Creation
// ==========================
export const createAd = async (
  customer: any,
  adGroupResourceName: string,
  adPayload: any,
  adType: string,
  containsEuPoliticalAdvertising: boolean
) => {
  try {
    const adCreatePayload: any = {
      ad_group: adGroupResourceName,
      status: "PAUSED",
      ad: adPayload,
    };

    if (
      containsEuPoliticalAdvertising &&
      adType.trim().toUpperCase() !== "VIDEO"
    ) {
      adCreatePayload.contains_eu_political_advertising =
        containsEuPoliticalAdvertising;
    }

    const ad = await customer.adGroupAds.create([adCreatePayload]);
    console.log("google ad  created finally", ad.results);
    return ad.results[0];
  } catch (err: any) {
    console.error("Google Ads API error:", JSON.stringify(err, null, 2));
  }
};

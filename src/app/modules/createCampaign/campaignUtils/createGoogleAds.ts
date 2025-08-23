import axios from "axios";
import sharp from "sharp";
import { googleAdsClient } from "../../../utils/googleAdsClient";

const createGoogleAdsFunction = async (
  customerId: string,
  refreshToken: string,
  finalUrl: string,
  adType: string,
  budgetAmountMicros: number,
  campaignName: string,
  adGroupName: string,
  cpcBidMicros: number,
  headlines: any[],
  descriptions: any[],
  longHeadline: { text: string },
  businessName: string,
  images: {
    landscape: string;
    square: string;
    logo_square: string;
    logo_wide?: string;
  },
  videoUrl: string,
  containsEuPoliticalAdvertising = false
) => {
  const customer = googleAdsClient.Customer({
    customer_id: customerId,
    refresh_token: refreshToken,
  });

  const loadImage = async (filePath: string) => {
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      const response = await axios.get(filePath, {
        responseType: "arraybuffer",
      });
      return Buffer.from(response.data);
    }
    return filePath;
  };

  const validateImageRatio = async (
    filePath: string,
    expectedRatio: number,
    label: string
  ) => {
    const input = await loadImage(filePath);
    const metadata = await sharp(input).metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;
    const actualRatio = parseFloat((width / height).toFixed(2));

    if (actualRatio !== expectedRatio) {
      throw new Error(
        `${label} must have ratio ${expectedRatio}, but got ${actualRatio} (${width}x${height})`
      );
    }
    return true;
  };

  const uploadImageAsset = async (
    imageUrl: string,
    type: "LANDSCAPE" | "SQUARE" | "LOGO_SQUARE" | "LOGO_WIDE"
  ) => {
    const { data } = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const timestamp = Date.now();

    let targetWidth = 1200;
    let targetHeight = 1200;

    switch (type) {
      case "LANDSCAPE":
        targetWidth = 1200;
        targetHeight = 628;
        break;
      case "SQUARE":
      case "LOGO_SQUARE":
        targetWidth = 1200;
        targetHeight = 1200;
        break;
      case "LOGO_WIDE":
        targetWidth = 4000;
        targetHeight = 1000;
        break;
    }

    const processedBuffer = await sharp(data)
      .resize(targetWidth, targetHeight, { fit: "fill" })
      .png()
      .toBuffer();

    const assetResult = await customer.assets.create([
      {
        name: `${type}_Asset_${timestamp}`,
        type: "IMAGE",
        image_asset: { data: processedBuffer },
      },
    ]);

    return assetResult.results[0].resource_name;
  };

  const uploadVideoAsset = async (videoUrl: string) => {
    const getYouTubeId = (url: string) => {
      try {
        if (url.includes("youtube.com"))
          return new URL(url).searchParams.get("v") || "";
        if (url.includes("youtu.be"))
          return url.split("/").pop()?.split("?")[0] || "";
        return url;
      } catch (err) {
        return "";
      }
    };

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
  };

  // ➤ Step 1: Create Budget
  const budget = await customer.campaignBudgets.create([
    {
      name: `Budget_${Date.now()}`,
      amount_micros: budgetAmountMicros || 2_500_000,
      delivery_method: "STANDARD",
    },
  ]);
  const budgetResourceName = budget.results[0].resource_name;

  // ➤ Step 2: Create Campaign
  const channelType =
    adType.toUpperCase() === "VIDEO" ? "VIDEO" : adType.toUpperCase();
  const campaign = await customer.campaigns.create([
    {
      name: `${campaignName || "Campaign"}_${Date.now()}`,
      advertising_channel_type: channelType,
      status: "PAUSED",
      manual_cpc: {},
      campaign_budget: budgetResourceName,
    },
  ]);
  const campaignResourceName = campaign.results[0].resource_name;

  // ➤ Step 3: Create Ad Group
  const adGroup = await customer.adGroups.create([
    {
      name: adGroupName || `AdGroup_${Date.now()}`,
      campaign: campaignResourceName,
      status: "PAUSED",
      cpc_bid_micros: cpcBidMicros || 1_000_000,
    },
  ]);
  const adGroupResourceName = adGroup.results[0].resource_name;

  // ➤ Step 4: Create Ad Payload
  let adPayload: any;

  switch (adType.trim().toUpperCase()) {
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

      const landscapeAsset = await uploadImageAsset(images.landscape, "LANDSCAPE");
      const squareAsset = await uploadImageAsset(images.square, "SQUARE");
      const squareLogoAsset = await uploadImageAsset(images.logo_square, "LOGO_SQUARE");

      const logoImages = [{ asset: squareLogoAsset }];
      if (images.logo_wide) {
        const logoWideAsset = await uploadImageAsset(images.logo_wide, "LOGO_WIDE");
        logoImages.push({ asset: logoWideAsset });
      }

      adPayload = {
        responsive_display_ad: {
          headlines,
          long_headline: longHeadline || { text: "Default Long Headline" },
          descriptions,
          business_name: businessName || "Your Business Name",
          marketing_images: [{ asset: landscapeAsset }],
          square_marketing_images: [{ asset: squareAsset }],
          logo_images: logoImages,
        },
        final_urls: [finalUrl],
      };
      break;

    case "VIDEO":
      if (!videoUrl) throw new Error("Video URL is required for VIDEO ads");

      const videoAsset = await uploadVideoAsset(videoUrl);

      adPayload = {
        responsive_video_ad: {
          videos: [{ asset: videoAsset }],
          headlines: headlines || [{ text: "Default Headline" }],
          descriptions: descriptions || [{ text: "Default Description" }],
        },
        final_urls: [finalUrl],
      };
      break;

    default:
      throw new Error(`Ad type "${adType}" is not supported.`);
  }

  // ➤ Step 5: Create Ad
  const adCreatePayload: any = {
    ad_group: adGroupResourceName,
    status: "PAUSED",
    ad: adPayload,
  };

  if (
    containsEuPoliticalAdvertising &&
    adType.trim().toUpperCase() !== "VIDEO"
  ) {
    adCreatePayload.contains_eu_political_advertising = true;
  }

  const ad = await customer.adGroupAds.create([adCreatePayload]);
  console.log(`✅ ${adType} Ad created:`, ad.results[0]);

  return ad.results[0];
};

export default createGoogleAdsFunction;

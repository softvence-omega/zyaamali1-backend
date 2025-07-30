import axios from "axios";
const bizSdk = require('facebook-nodejs-business-sdk');
const { FacebookAdsApi, AdAccount, Campaign, AdSet, AdCreative, Ad } = bizSdk;
import FormData from 'form-data';



const uploadImageService = async (
  accessToken: string,
  adAccountId: string,
  imageUrl: string
): Promise<string> => {
  const endpoint = `https://graph.facebook.com/v19.0/act_${adAccountId}/adimages`;

  const form = new FormData();
  form.append('url', imageUrl);

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
        name: '🚫 Safe Test Campaign',
        objective: 'LINK_CLICKS',
        status: 'PAUSED',
        special_ad_categories: [],
    });

    // 2. Ad Set
    const adSet = await new AdAccount(adAccountId).createAdSet([], {
        name: '🚫 Safe Test Ad Set',
        campaign_id: campaign.id,
        daily_budget: 1000,
        billing_event: 'IMPRESSIONS',
        optimization_goal: 'LINK_CLICKS',
        targeting: {
            geo_locations: { countries: ['US'] },
        },
        start_time: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'PAUSED',
    });

    // 3. Creative
    const creative = await new AdAccount(adAccountId).createAdCreative([], {
        name: 'Test Creative',
        object_story_spec: {
            page_id: pageId,
            link_data: {
                message: '🚀 This is a safe test ad (paused)',
                link: 'https://your-landing-page.com',
                image_hash: imageHash,
            },
        },
    });

    // 4. Ad
    const ad = await new AdAccount(adAccountId).createAd([], {
        name: '🚫 Safe Test Ad',
        adset_id: adSet.id,
        creative: { creative_id: creative.id },
        status: 'PAUSED',
    });

    return {
        campaignId: campaign.id,
        adSetId: adSet.id,
        creativeId: creative.id,
        adId: ad.id,
    };
};


export const createCampaignService = {
    uploadImageService,
    createAdService
}

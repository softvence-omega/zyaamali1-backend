import axios from "axios";
const bizSdk = require('facebook-nodejs-business-sdk');
const { FacebookAdsApi, AdAccount, Campaign, AdSet, AdCreative, Ad } = bizSdk;
import FormData from 'form-data';
import { customer, getGoogleAdsClient } from "../../utils/googleAdsAuth";



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





// for google 

async function createGoogleCampaign(
    clientId: string,
    campaignName: string,
    budgetMicros: number
) {
    try {
        const fullCampaignName = `${clientId}_${campaignName}`;

        // Create campaign budget
        const budgetResponse = await customer.campaignBudgets.create([
            {
                name: `${fullCampaignName}_budget`,
                amount_micros: budgetMicros,
                delivery_method: 'STANDARD',
            },
        ]);

        const budgetResourceName = budgetResponse.results[0].resource_name;

        // Create campaign
        const campaignResponse = await customer.campaigns.create([
            {
                name: fullCampaignName,
                advertising_channel_type: 'SEARCH',
                status: 'PAUSED',
                campaign_budget: budgetResourceName,
            },
        ]);

        const campaignResourceName = campaignResponse.results[0].resource_name;

        return {
            campaign: campaignResourceName,
            budget: budgetResourceName,
        };
    } catch (error) {
        console.error('Error creating campaign:', error);
        throw error;
    }
}



// Fetch campaign spending for last 7 days
async function getGoogleCampaignSpend(campaignResourceName: string) {
    try {
        const query = `
      SELECT
        campaign.id,
        campaign.name,
        metrics.cost_micros,
        segments.date
      FROM campaign
      WHERE campaign.resource_name = '${campaignResourceName}'
        AND segments.date DURING LAST_7_DAYS
    `;

        const response = await customer.query(query);

        const spends: Array<{
            campaignId: string;
            campaignName: string;
            costMicros: number;
            date: string;
        }> = [];

        for await (const row of response) {
            spends.push({
                campaignId: row.campaign?.id?.toString() || '',
                campaignName: row.campaign?.name || '',
                costMicros: row.metrics?.cost_micros || 0,
                date: row.segments?.date || '',
            });
        }

        return spends;
    } catch (error) {
        console.error('Error fetching campaign spend:', error);
        throw error;
    }
}





export const createCampaignService = {
    uploadImageService,
    createAdService,
    createGoogleCampaign,
    getGoogleCampaignSpend
}

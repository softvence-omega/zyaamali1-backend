import { Request, Response } from 'express';
import { createCampaignService } from './createCampaign.service';


const uploadImageController = async (req: Request, res: Response) => {
  try {
    const { accessToken, adAccountId, imageUrl } = req.body;

    if (!accessToken || !adAccountId || !imageUrl) {
      return res.status(400).json({ message: 'Missing required parameters like accessToken, adAccountId, or imageUrl' });
    }

    const imageHash = await createCampaignService.uploadImageService(
      accessToken,
      adAccountId,
      imageUrl
    );

    return res.status(200).json({ imageHash });
  } catch (error: any) {
    console.error('❌ Upload Image Error:', error.response?.data || error.message);
    return res.status(500).json({
      message: 'Failed to upload image',
      error: error.response?.data || error.message,
    });
  }
};


const createAdController = async (req: Request, res: Response) => {
  const { accessToken, adAccountId, pageId, imageHash } = req.body;

  if (!accessToken || !adAccountId || !pageId || !imageHash) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }

  try {
    const result = await createCampaignService.createAdService(accessToken, adAccountId, pageId, imageHash);
    return res.status(200).json({ message: '✅ Safe test ad created', result });
  } catch (error: any) {
    console.error('❌ Error in controller:', error.message || error);
    return res.status(500).json({ message: 'Failed to create test ad' });
  }
};




// for google 

async function createGoogleCampaign(req: Request, res: Response) {
  try {
    const { clientId, campaignName, budgetMicros } = req.body;

    if (!clientId || !campaignName || !budgetMicros) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const result = await createCampaignService.createGoogleCampaign(clientId, campaignName, budgetMicros);

    // TODO: Save campaign.resource_name and clientId in your DB here

    return res.status(201).json({
      message: 'Campaign created successfully',
      campaign: result.campaign,
      budget: result.budget,
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return res.status(500).json({ error: 'Failed to create campaign.' });
  }
}

// get google campaign spend cost
async function getGoogleCampaignSpend(req: Request, res: Response) {
  try {
    const { campaignResourceName } = req.query;

    if (!campaignResourceName) {
      return res.status(400).json({ error: 'campaignResourceName query param is required.' });
    }

    const spends = await createCampaignService.getGoogleCampaignSpend(campaignResourceName);

    return res.status(200).json(spends);
  } catch (error) {
    console.error('Error fetching campaign spend:', error);
    return res.status(500).json({ error: 'Failed to fetch campaign spending.' });
  }
}


export const createCampaignController = {
  uploadImageController,
  createAdController,
  createGoogleCampaign,
  getGoogleCampaignSpend
}
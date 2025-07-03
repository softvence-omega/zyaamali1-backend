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

export const createCampaignController = {
    uploadImageController,
    createAdController
}
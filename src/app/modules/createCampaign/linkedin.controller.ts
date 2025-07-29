import { Request, Response } from 'express';
import {
  generateLinkedInAuthUrl,
  exchangeLinkedInCode,
  createLinkedInAd,
} from './linkedin.service';

// Redirect user to LinkedIn OAuth
export const linkedinAuthRedirect = (req: Request, res: Response) => {
  const authUrl = generateLinkedInAuthUrl();
  res.redirect(authUrl);
};

// Handle OAuth callback and save tokens
export const linkedinAuthCallback = async (req: Request, res: Response) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Missing code');

  const tokenData = await exchangeLinkedInCode(code as string);
  // Save tokenData.access_token and expires_in to user profile
  // ...

  res.send('LinkedIn connected successfully.');
};

// Create Ad in LinkedIn
export const createLinkedInAdController = async (req: Request, res: Response) => {
  const { accessToken, adAccountId, campaignId, creativeText, creativeMediaId } = req.body;
  if (!accessToken || !adAccountId || !campaignId || !creativeText) {
    return res.status(400).json({ message: 'Missing required params' });
  }
  try {
    const result = await createLinkedInAd({ accessToken, adAccountId, campaignId, creativeText, creativeMediaId });
    res.status(200).json({ success: true, result });
  } catch (err: any) {
    console.error('LinkedIn ad error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Failed to create LinkedIn ad', error: err.response?.data || err.message });
  }
};

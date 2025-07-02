import { Request, Response } from 'express';
import axios from 'axios';
import config from '../../config';
import {  connectAdsAccountservice } from './connectAdsAccount.service';
import { FacebookAdsApi, User, AdAccount } from 'facebook-nodejs-business-sdk';


// for facebook connection 


const redirectToFacebookOAuth = (req: Request, res: Response) => {
  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${config.facebookAppId}&redirect_uri=${config.facebookRedirectUri}&scope=ads_management,ads_read,pages_show_list`;
  res.redirect(authUrl);
};

const handleFacebookCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string;
  if (!code) return res.status(400).send('Authorization code is missing');

  try {
    const accessToken = await connectAdsAccountservice.getFacebookAccessToken(code);
    FacebookAdsApi.init(accessToken);

    const user = new User('me');
    const adAccounts = await user.getAdAccounts();
    if (!adAccounts.length) return res.status(400).send('No ad accounts found.');

    const selectedAdAccount = adAccounts[0];

    // Save accessToken + adAccountId to DB (if needed)
    return res.status(200).json({
      message: '✅ Facebook connected',
      accessToken,
      adAccountId: selectedAdAccount.id,
    });
  } catch (error: any) {
    console.error('❌ Facebook OAuth error:', error.response?.data || error.message);
    return res.status(500).send('Failed to connect Facebook Ads account');
  }
};

 const getFacebookAdsConnection = async (req: Request, res: Response) => {
  const userId = req.query.userId as string;

  // Example: fetch user's stored token from DB (replace with real DB call)
  const accessToken = "EAA7r59ZAbUhYBO8B7gUwInOrLDAkZCjbhba2AehRGYiGNmK1RUf2KMcPc6UFvM9tJlPO5eb9DOqjzmwu3Mhc6dj0BzBHVdP0RQF1JRFwrgPvFD3i503EXiK3GqUaqwdLSQ0JdVPn9CUlLgJLLNVIZBoCZBWeVXuhYvyQ1LJy4I5ZBZCXBrSA8tfmurqimJDFraQUCzyCs20YGRrpwC1U3mvBKBsJUsKVCUj2sLiaZBANIAWLukswZC6SekjdyQ2K"

  if (!accessToken) {
    return res.status(401).json({ connected: false, message: 'Not connected' });
  }

  try {
    const adAccounts = await connectAdsAccountservice.getFacebookAdAccounts(accessToken);

    if (adAccounts && adAccounts.length > 0) {
      return res.status(200).json({ connected: true, adAccounts });
    } else {
      return res.status(200).json({ connected: false, message: 'No ad accounts found' });
    }
  } catch (error: any) {
    console.error('Failed to check ad accounts:', error.message);
    return res.status(500).json({ connected: false, message: 'Token invalid or expired' });
  }
};







// for instagram connection 


const handleInstagramConnection = async (req: Request, res: Response) => {
  const accessToken = req.query.accessToken as string;
  if (!accessToken) return res.status(400).send('Missing access token');

  try {
    const pagesRes = await axios.get('https://graph.facebook.com/v19.0/me/accounts', {
      params: { access_token: accessToken },
    });

    for (const page of pagesRes.data.data) {
      const pageDetails = await axios.get(`https://graph.facebook.com/v19.0/${page.id}`, {
        params: {
          access_token: accessToken,
          fields: 'connected_instagram_account',
        },
      });

      const instagram = pageDetails.data.connected_instagram_account;
      if (instagram) {
        return res.status(200).json({
          message: '✅ Instagram connected via Page',
          instagram: {
            id: instagram.id,
            username: instagram.username,
          },
        });
      }
    }

    return res.status(404).json({
      message: 'No Instagram account found on any managed Page',
      instagramConnected: false,
    });
  } catch (error: any) {
    console.error('❌ Instagram check error:', error.response?.data || error.message);
    return res.status(500).send('Failed to check Instagram connection');
  }
};




//  fro linkdin connection 

const redirectToLinkedIn = (req: Request, res: Response) => {
  const authURL = connectAdsAccountservice.getLinkdinAuthURL();
  console.log('from  linkedin redirect ===================')
  res.redirect(authURL);
};

const handleLinkedInCallback = async (req: Request, res: Response) => {
  const code = req.query.code;

  console.log('form linkedin callback ===================================> ')

  try {
    const accessToken = await connectAdsAccountservice.getLinkdinAccessToken(code);
    // Optionally: store accessToken in DB here
    res.json({ access_token: accessToken });
  } catch (error) {
    console.error('❌ Error getting access token:', error.message);
    res.status(500).json({ error: 'Failed to retrieve access token' });
  }
};




// for google 

 const getGoogleAuthURL= (req: Request, res: Response) => {
  const authURL = connectAdsAccountservice.generateGoogleAuthURL();
    console.log('from  google  redirect ===================')
  res.redirect(authURL);
};

 const handleGoogleCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string;

  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  try {
    const tokens = await connectAdsAccountservice.exchangeGoogleCodeForToken(code);
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ error: 'Failed to exchange code for token' });
  }
};






// for tiktok 


const getTiktokAuthUrl = (req, res) => {
  const url = connectAdsAccountservice.getTiktokAuthUrl();
  res.redirect(url);
};

const handleTiktokCallback = async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('Missing authorization code');

  try {
    const tokenData = await connectAdsAccountservice.handleTiktokCodeForToken(code);
    res.json(tokenData);
  } catch (error) {
    console.error('❌ TikTok callback error:', error.message);
    res.status(500).send('TikTok OAuth failed');
  }
};









export const connectAdsAccountController = {
  redirectToFacebookOAuth,
  handleFacebookCallback,
  handleInstagramConnection,
  getFacebookAdsConnection,
  redirectToLinkedIn,
  handleLinkedInCallback,
  getGoogleAuthURL,
  handleGoogleCallback,
  getTiktokAuthUrl,
  handleTiktokCallback
}
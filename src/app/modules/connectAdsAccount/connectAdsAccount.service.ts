import axios from 'axios';
import config from '../../config';
import { FacebookAdsApi, User, AdAccount } from 'facebook-nodejs-business-sdk';
const {
  LINKEDIN_CLIENT_ID,
  LINKEDIN_CLIENT_SECRET,
  LINKEDIN_REDIRECT_URI,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
} = process.env;

const getFacebookAccessToken = async (code: string) => {
  const response = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
    params: {
      client_id: config.facebookAppId,
      client_secret: config.facebookAppSecret,
      redirect_uri: config.facebookRedirectUri,
      code,
    },
  });

  return response.data.access_token;
};

const getFacebookAdAccounts = async (accessToken: string) => {
  FacebookAdsApi.init(accessToken); // Sets the default token for SDK

  const user = new User('me');
  const adAccounts = await user.getAdAccounts(); // No need to pass token here

  return adAccounts.map(account => ({
    id: account.id,
    name: account.name,
    account_status: account.account_status,
  }));
};

// for instagram

const getInstagramAccounts = async (accessToken: string, adAccountId: string) => {
  FacebookAdsApi.init(accessToken);
  const adAccount = new AdAccount(adAccountId);
  const instaAccounts = await adAccount.getInstagramAccounts();

  return instaAccounts.map(insta => ({
    id: insta.id,
    name: insta.name,
    username: insta.username,
  }));
};



// for linkdin connection 

const getLinkdinAuthURL = () => {
  if (!LINKEDIN_CLIENT_ID || !LINKEDIN_REDIRECT_URI) {
    throw new Error('Missing LinkedIn client ID or redirect URI');
  }


  const base = 'https://www.linkedin.com/oauth/v2/authorization';
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: LINKEDIN_CLIENT_ID,
    redirect_uri: LINKEDIN_REDIRECT_URI,
    scope: 'r_ads' // Safe fallback
   //scope: 'r_ads'
  });

  return `${base}?${params.toString()}`;
};


const getLinkdinAccessToken = async (code: any) => {
  const response = await axios.post(
    'https://www.linkedin.com/oauth/v2/accessToken',
    null,
    {
      params: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: LINKEDIN_REDIRECT_URI,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return response.data.access_token;
};

const getlinkedinAdAccounts = async (accessToken: any) => {

  const res = await axios.get(
    'https://api.linkedin.com/v2/adAccountsV2?q=search',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return res.data;
};



// for google 

 const generateGoogleAuthURL= () => {

  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID!,
    redirect_uri: GOOGLE_REDIRECT_URI!,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/adwords',
    ].join(' '),
  });

  return `${rootUrl}?${params.toString()}`;
};


 const exchangeGoogleCodeForToken= async (code: string) => {

  console.log('from google accessToken code ===================================>inside sercice ')
  const response = await axios.post('https://oauth2.googleapis.com/token', {
    code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: GOOGLE_REDIRECT_URI,
    grant_type: 'authorization_code',
  });

  const { access_token, refresh_token, expires_in } = response.data;

  return {
    access_token,
    refresh_token,
    expires_in,
  };
};



// for tiktok connection 

const getTiktokAuthUrl = () => {
  const base = 'https://business-api.tiktok.com/open_api/oauth2/authorize/';

 // const base = 'https://ads.tiktok.com/marketing_api/auth';
  const params = new URLSearchParams({
    app_id: process.env.TIKTOK_CLIENT_ID as string,
    redirect_uri: process.env.TIKTOK_REDIRECT_URI  as string,
    response_type: 'code',
    state: 'custom_state_token',
    scope: 'user.info.basic,ad.account.list'
  });
  return `${base}?${params.toString()}`;
};

const exchangeTiktokCodeForToken = async (code: any) => {
  console.log('from callback form tiktok ===================')
  const response = await axios.post('https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/', {
    app_id: process.env.TIKTOK_CLIENT_ID,
    secret: process.env.TIKTOK_SECRET,
    auth_code: code,
    grant_type: 'authorization_code'
  });

  const { access_token, advertiser_ids } = response.data.data;
  return {
    accessToken: access_token,
    advertiserIds: advertiser_ids
  };
};


 export const connectAdsAccountservice = {
  getFacebookAccessToken,
  getFacebookAdAccounts,
  getInstagramAccounts,
  getLinkdinAuthURL,
  getLinkdinAccessToken,
  getlinkedinAdAccounts,
  generateGoogleAuthURL,
  exchangeGoogleCodeForToken,
  getTiktokAuthUrl,
  exchangeTiktokCodeForToken

}

import axios from "axios";
import config from "../../config";
import { FacebookAdsApi, User, AdAccount } from "facebook-nodejs-business-sdk";

import { OAuth2Client } from "google-auth-library";

const {
  LINKEDIN_CLIENT_ID,
  LINKEDIN_CLIENT_SECRET,
  LINKEDIN_REDIRECT_URI,
  GOOGLE_CLIENT_ID2,
  GOOGLE_CLIENT_SECRET2,
  GOOGLE_REDIRECT_URI2,
} = process.env;

const getFacebookAccessToken = async (code: string) => {
  const response = await axios.get(
    "https://graph.facebook.com/v19.0/oauth/access_token",
    {
      params: {
        client_id: config.facebookAppId,
        client_secret: config.facebookAppSecret,
        redirect_uri: config.facebookRedirectUri,
        code,
      },
    }
  );

  return response.data.access_token;
};



// for instagram

const getInstagramAccounts = async (
  accessToken: string,
  adAccountId: string
) => {
  FacebookAdsApi.init(accessToken);
  const adAccount = new AdAccount(adAccountId);
  const instaAccounts = await adAccount.getInstagramAccounts(['id', 'username']);

  return instaAccounts.map((insta) => ({
    id: insta.id,
    name: insta.name,
    username: insta.username,
  }));
};

// for linkdin connection

const getLinkdinAuthURL = () => {
  if (!LINKEDIN_CLIENT_ID || !LINKEDIN_REDIRECT_URI) {
    throw new Error("Missing LinkedIn client ID or redirect URI");
  }

  const base = "https://www.linkedin.com/oauth/v2/authorization";
  const params = new URLSearchParams({
    response_type: "code",
    client_id: LINKEDIN_CLIENT_ID,
    redirect_uri: LINKEDIN_REDIRECT_URI,

    scope: "r_ads,rw_ads,rw_organization_admin",
  });

  return `${base}?${params.toString()}`;
};

const getLinkdinAccessToken = async (code: any) => {
  const response = await axios.post(
    "https://www.linkedin.com/oauth/v2/accessToken",
    null,
    {
      params: {
        grant_type: "authorization_code",
        code,
        redirect_uri: LINKEDIN_REDIRECT_URI,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data.access_token;
};

export const getLinkedinAdAccountsAndOrganizations = async (
  accessToken: string
) => {
  try {
    // Fetch Ad Accounts
    const adAccountResponse = await axios.get(
      "https://api.linkedin.com/v2/adAccountsV2?q=search",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Restli-Protocol-Version": "2.0.0",
        },
      }
    );

    const adAccounts = adAccountResponse.data;

    // Fetch Organizations (where user is admin)
    const orgResponse = await axios.get(
      "https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Restli-Protocol-Version": "2.0.0",
        },
      }
    );
    console.log(orgResponse.data.elements);
    const organizations = orgResponse.data.elements.map(
      (el: any) => el.organizationalTarget
    );

    return {
      adAccounts, // List of ad accounts
      organizations, // List of organization URNs
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch LinkedIn data: ${error.message}`);
  }
};

// for google

export const getGoogleOAuthUrl = () => {
  const scopes = [
    "https://www.googleapis.com/auth/adwords",
    "https://www.googleapis.com/auth/userinfo.email",
  ];

  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID2,
    process.env.GOOGLE_CLIENT_SECRET2,
    process.env.GOOGLE_REDIRECT_URI2
  );

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
    include_granted_scopes: true, // Optional: incremental auth
    state: "your_csrf_token_here", // Security measure
  });

  return url;
};


export const exchangeCodeForTokens = async (code: string) => {
  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID2,
    process.env.GOOGLE_CLIENT_SECRET2,
    process.env.GOOGLE_REDIRECT_URI2
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log(tokens);
    return tokens;
  } catch (err) {
    throw new Error("Invalid or expired authorization code");
  }
};

export const fetchGoogleAdAccounts = async (accessToken: string) => {
  try {
    const response = await axios.get(
      "https://content-googleads.googleapis.com/v20/customers:listAccessibleCustomers",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "developer-token": process.env.GOOGLE_DEVELOPER_TOKEN2!,
          "login-customer-id": process.env.GOOGLE_MANAGER_ID2!, // only if using an MCC account
        },
      }
    );

    return response.data;
  } catch (err: any) {
    console.error("Google Ads API Error:", err.response?.data || err.message);
    throw new Error(
      "Failed to fetch accounts. Check token, dev token, and MCC ID."
    );
  }
};

// for tiktok connection
const getTiktokAuthUrl = () => {
  const base = "https://ads.tiktok.com/marketing_api/auth";
  const params = new URLSearchParams({
    app_id: process.env.TIKTOK_CLIENT_ID!,
    redirect_uri: process.env.TIKTOK_REDIRECT_URI!,
    response_type: "code",
    scope: "user.info.basic,ad.account.list,ad.report.basic, ad.create",
    state: "random_unique_string", // ideally generate this per user/session
  });
  return `${base}?${params.toString()}`;
};

const exchangeTiktokCodeForToken = async (code: string) => {
  try {
    const response = await axios.post(
      "https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/",
      {
        app_id: process.env.TIKTOK_CLIENT_ID,
        secret: process.env.TIKTOK_SECRET,
        auth_code: code,
        grant_type: "authorization_code",
      }
    );

    console.log("Tiktok token response:", response.data.data);

    const { access_token, advertiser_ids } = response.data.data;

    return {
      accessToken: access_token,
      advertiserIds: advertiser_ids,
    };
  } catch (err:any) {
    console.error(
      "Failed to exchange code:",
      err.response?.data || err.message
    );
    throw err;
  }
};

export const connectAdsAccountservice = {
  getFacebookAccessToken,
  // getFacebookAdAccounts,
  getInstagramAccounts,
  getLinkdinAuthURL,
  getLinkdinAccessToken,
  getLinkedinAdAccountsAndOrganizations,

  getTiktokAuthUrl,
  exchangeTiktokCodeForToken,
};

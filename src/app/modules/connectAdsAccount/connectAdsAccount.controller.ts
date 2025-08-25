import { Request, Response } from "express";
import axios from "axios";
import config from "../../config";

import {
  connectAdsAccountservice,
  exchangeCodeForTokens,
  getGoogleOAuthUrl,
} from "./connectAdsAccount.service";

import { FacebookAdsApi, User, AdAccount } from "facebook-nodejs-business-sdk";
import { ConnectAccountModel } from "./connectAdsAccount.model";

// for facebook connection

const redirectToFacebookOAuth = (req: Request, res: Response) => {
  const scopes = [
    "public_profile",
    "business_management",
    "pages_show_list",
    "ads_management",
    "pages_read_engagement",
    "ads_read",
  ].join(",");

  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${
    config.facebookAppId
  }&redirect_uri=${encodeURIComponent(
    config.facebookRedirectUri
  )}&scope=${scopes}&auth_type=rerequest`;

  console.log("Redirecting to Facebook OAuth:", authUrl);
  res.redirect(authUrl);
};
export const handleFacebookCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string;
  if (!code)
    return res
      .status(400)
      .json({ success: false, message: "Authorization code is missing" });

  try {
    // ✅ Step 1: Exchange code for access token
    const accessToken = await connectAdsAccountservice.getFacebookAccessToken(
      code
    );
    FacebookAdsApi.init(accessToken);

    // ✅ Step 2: Get Ad Accounts
    const user = new User("me");
    const adAccounts = await user.getAdAccounts(["id", "name"]);
    if (!adAccounts.length) {
      return res
        .status(400)
        .json({ success: false, message: "No ad accounts found" });
    }

    // ✅ Step 3: Get Facebook Pages
    const pagesRes = await axios.get(
      `https://graph.facebook.com/v19.0/me/accounts`,
      {
        params: { access_token: accessToken },
      }
    );

    const pages = pagesRes.data.data || [];
    if (!pages.length) {
      return res
        .status(400)
        .json({ success: false, message: "No Facebook Pages found" });
    }

    // ✅ Step 4: Save or Update DB
    const storeFacebookData = await ConnectAccountModel.findOneAndUpdate(
      { name: "Meta Ads" }, // use unique identifier, maybe userId if available
      {
        name: "Meta Ads",
        icon: "https://img.icons8.com/color/48/000000/facebook-new.png",
        accessToken,
        adAccount: adAccounts.map((account) => ({
          id: account.id,
          name: account.name,
        })),
        pages: pages.map((page: any) => ({
          pageId: page.id,
          pageName: page.name,
          pageAccessToken: page.access_token,
        })),
      },
      { new: true, upsert: true } // upsert = insert if not exists
    );

    console.log("✅ Stored Data:", storeFacebookData);

    // ✅ Step 5: Response
    return res.status(200).json({
      success: true,
      message: "✅ Facebook connected successfully",
      data: storeFacebookData,
    });
  } catch (error: any) {
    console.error(
      "❌ Facebook OAuth error:",
      error.response?.data || error.message
    );
    return res.status(500).json({
      success: false,
      message: "❌ Failed to connect Facebook Ads account",
      error: error.response?.data || error.message,
    });
  }
};

// for instagram connection
const handleInstagramConnection = async (req: Request, res: Response) => {
  const accessToken = req.query.accessToken as string;
  if (!accessToken) return res.status(400).send("Missing access token");

  try {
    const pagesRes = await axios.get(
      "https://graph.facebook.com/v19.0/me/accounts",
      {
        params: { access_token: accessToken },
      }
    );

    for (const page of pagesRes.data.data) {
      const pageDetails = await axios.get(
        `https://graph.facebook.com/v19.0/${page.id}`,
        {
          params: {
            access_token: accessToken,
            fields: "connected_instagram_account",
          },
        }
      );

      const instagram = pageDetails.data.connected_instagram_account;
      if (instagram) {
        return res.status(200).json({
          message: "✅ Instagram connected via Page",
          instagram: {
            id: instagram.id,
            username: instagram.username,
          },
        });
      }
    }

    return res.status(404).json({
      message: "No Instagram account found on any managed Page",
      instagramConnected: false,
    });
  } catch (error: any) {
    console.error(
      "❌ Instagram check error:",
      error.response?.data || error.message
    );
    return res.status(500).send("Failed to check Instagram connection");
  }
};

//  fro linkdin connection
const redirectToLinkedIn = (req: Request, res: Response) => {
  const authURL = connectAdsAccountservice.getLinkdinAuthURL();

  console.log(authURL);

  res.redirect(authURL);
};

export const handleLinkedInCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string;
  if (!code)
    return res
      .status(400)
      .json({ success: false, message: "Authorization code is missing" });

  try {
    // ✅ Step 1: Exchange code for access token
    const token = await connectAdsAccountservice.getLinkdinAccessToken(code);
    const accessToken = token.access_token;
    console.log("✅ LinkedIn Access Token:", accessToken);

    // ✅ Step 2: Fetch LinkedIn Ad Accounts
    const adAccountsResponse = await axios.get(
      "https://api.linkedin.com/v2/adAccountsV2?q=search",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const adAccounts = adAccountsResponse.data.elements || [];
    if (!adAccounts.length) {
      return res
        .status(404)
        .json({ success: false, message: "No LinkedIn ad accounts found" });
    }

    // ✅ Step 3: Store in MongoDB (update or create)
    const storeLinkedInData = await ConnectAccountModel.findOneAndUpdate(
      { name: "LinkedIn Ads" }, // change to { userId, platform: "linkedin" } if multi-user support needed
      {
        name: "LinkedIn Ads",
        icon: "https://img.icons8.com/color/48/000000/linkedin.png",
        accessToken,
        adAccount: adAccounts.map((acc: any) => ({
          id: acc.id,
          name: acc.name || `Ad Account ${acc.id}`, // fallback if name missing
        })),
      },
      { new: true, upsert: true }
    );

    console.log("✅ Stored LinkedIn Data:", storeLinkedInData);

    // ✅ Step 4: Respond to client
    return res.status(200).json({
      success: true,
      message: "✅ LinkedIn connected successfully",
      data: storeLinkedInData,
    });
  } catch (error: any) {
    console.error(
      "❌ LinkedIn OAuth error:",
      error.response?.data || error.message
    );
    return res.status(500).json({
      success: false,
      message: "❌ Failed to connect LinkedIn Ads account",
      error: error.response?.data || error.message,
    });
  }
};

// for google

// for fetch ads account
const fetchGoogleAdAccounts = async (accessToken: string) => {
  try {
    const response = await axios.get(
      "https://googleads.googleapis.com/v20/customers:listAccessibleCustomers",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "developer-token": process.env.GOOGLE_DEVELOPER_TOKEN2!,
          "login-customer-id": process.env.GOOGLE_MANAGER_ID2!, // required if MCC
        },
      }
    );

    return response.data.resourceNames || [];
  } catch (err: any) {
    console.error(
      "❌ Google Ads API Error:",
      err.response?.data || err.message
    );
    throw new Error(
      "Failed to fetch accounts. Check token, dev token, and MCC ID."
    );
  }
};
export const googleAuthRedirect = (req: Request, res: Response) => {
  const url = getGoogleOAuthUrl();
  console.log(url);
  res.redirect(url);
};
// ✅ Google OAuth Callback
export const googleAuthCallback = async (req: Request, res: Response) => {
  const code = req.query.code;
  console.log(code, "code from google");

  if (typeof code !== "string" || !code) {
    return res
      .status(400)
      .json({ error: "Authorization code is missing or invalid." });
  }

  try {
    // Step 1: Exchange code for access & refresh tokens
    const tokens = await exchangeCodeForTokens(code);
    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token;

    // Step 2: Fetch Ad Accounts
    const accounts = await fetchGoogleAdAccounts(accessToken as string);
    console.log("✅ Google Ad Accounts:", accounts);

    // Step 3: Store in DB
    const storedGoogleData = await ConnectAccountModel.findOneAndUpdate(
      { name: "Google Ads" },
      {
        name: "Google Ads",
        icon: "https://img.icons8.com/color/48/000000/google-ads.png",
        accessToken,
        refreshToken,
        adAccount: accounts.map((acc: string) => ({
          id: acc.replace("customers/", ""), // "customers/1234567890" → "1234567890"
          name: acc, // Google doesn’t always return name directly
        })),
      },
      { new: true, upsert: true }
    );

    // Step 4: Respond to frontend
    res.json({
      success: true,
      message: "✅ Google Ads connected successfully.",
      // tokens,
      // adAccounts: accounts,
      data: storedGoogleData,
    });
  } catch (error: any) {
    console.error(
      "❌ Google OAuth error:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to connect Google Ads account" });
  }
};

// for tiktok
const getTiktokAuthUrl = (req: Request, res: Response) => {
  const url = connectAdsAccountservice.getTiktokAuthUrl();

  console.log("url from tiktok", url);

  res.redirect(url);
};
export const handleTiktokCallback = async (req: Request, res: Response) => {
  const code = req.query.code;

  if (typeof code !== "string" || !code) {
    return res.status(400).send("Missing or invalid authorization code");
  }

  try {
    // ✅ Step 1: Exchange code for access token + advertiser accounts
    const tokenData = await connectAdsAccountservice.exchangeTiktokCodeForToken(
      code
    );

    const accessToken = tokenData.accessToken;
    const advertiserIds = tokenData.advertiserIds || [];

    // ✅ Step 2: Save to MongoDB
    const storedTiktokData = await ConnectAccountModel.findOneAndUpdate(
      { name: "TikTok Ads" },
      {
        name: "TikTok Ads",
        icon: "https://img.icons8.com/color/48/000000/tiktok--v1.png",
        accessToken,
        adAccount: advertiserIds.map((id: string) => ({
          id,
          name: `TikTok Advertiser ${id}`, // TikTok doesn’t always return a name; you can later enhance
        })),
      },
      { new: true, upsert: true }
    );

    console.log("✅ TikTok data stored:", storedTiktokData);

    // ✅ Step 3: Respond back
    return res.status(200).json({
      message: "✅ TikTok connected successfully",
      data: storedTiktokData,
    });
  } catch (error: any) {
    console.error(
      "❌ TikTok callback error:",
      error.response?.data || error.message
    );
    return res.status(500).send("TikTok OAuth failed");
  }
};

export const getAllDataFromDB = async (req: Request, res: Response) => {
  try {
    const result = await connectAdsAccountservice.getAllDataFromDB();
    console.log("reslut -----------", result);

    if (!result || result.length === 0) {
      return res.json({
        success: false,
        message: "No  data found in database",
      });
    }

    return res.status(200).json({
      success: true,
      message: "✅  data fetched successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("❌ Error fetching  data:", error.message || error);

    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching  data",
      error: error.message || "Unknown error",
    });
  }
};

export const updateSingleData = async (req: Request, res: Response) => {
  const name = req.query.name;
  console.log(name, 'name')
  try {
    const result = await connectAdsAccountservice.updateSingleData(name as string);
    console.log("reslut -----------", result);

    if (!result ) {
      return res.json({
        success: false,
        message: "No  data found in database",
      });
    }

    return res.status(200).json({
      success: true,
      message: "✅  data updated successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("❌ Error updateing  data:", error.message || error);

    return res.status(500).json({
      success: false,
      message: "Internal server error while update  data",
      error: error.message || "Unknown error",
    });
  }
};

export const connectAdsAccountController = {
  redirectToFacebookOAuth,
  handleFacebookCallback,

  handleInstagramConnection,

  redirectToLinkedIn,
  handleLinkedInCallback,

  getTiktokAuthUrl,
  handleTiktokCallback,

  getAllDataFromDB,
  updateSingleData,
};

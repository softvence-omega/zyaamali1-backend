import { Request, Response } from "express";
import axios from "axios";
import config from "../../config";

import {
  connectAdsAccountservice,
  exchangeCodeForTokens,
  fetchGoogleAdAccounts,
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
  if (!code) return res.status(400).json({ success: false, message: "Authorization code is missing" });

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
      return res.status(404).json({ success: false, message: "No LinkedIn ad accounts found" });
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
    console.error("❌ LinkedIn OAuth error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "❌ Failed to connect LinkedIn Ads account",
      error: error.response?.data || error.message,
    });
  }
};


// for google
export const googleAuthRedirect = (req: Request, res: Response) => {
  const url = getGoogleOAuthUrl();
  console.log(url);
  res.redirect(url);
};

export const googleAuthCallback = async (req: Request, res: Response) => {
  const code = req.query.code;
  console.log(code, "code from google");
  if (typeof code !== "string" || !code) {
    return res
      .status(400)
      .json({ error: "Authorization code is missing or invalid." });
  }
  const tokens = await exchangeCodeForTokens(code);

  // Save tokens.access_token and tokens.refresh_token to your DB for the user
  res.json({
    message: "Google Ads connected successfully.",
    token: tokens,
  });
};

export const getGoogleAdAccounts = async (req: Request, res: Response) => {
  const accessToken = req.headers.authorization?.replace("Bearer ", "");

  if (!accessToken)
    return res.status(401).json({ error: "Access token missing" });

  try {
    const accounts = await fetchGoogleAdAccounts(accessToken);
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch Google Ad accounts" });
  }
};

// for tiktok
const getTiktokAuthUrl = (req: Request, res: Response) => {
  const url = connectAdsAccountservice.getTiktokAuthUrl();

  console.log("url from tiktok", url);

  res.redirect(url);
};

const handleTiktokCallback = async (req: Request, res: Response) => {
  const code = req.query.code;

  if (typeof code !== "string" || !code) {
    return res.status(400).send("Missing or invalid authorization code");
  }

  try {
    const tokenData = await connectAdsAccountservice.exchangeTiktokCodeForToken(
      code
    );
    res.json(tokenData);
  } catch (error: any) {
    console.error("❌ TikTok callback error:", error.message);
    res.status(500).send("TikTok OAuth failed");
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
};

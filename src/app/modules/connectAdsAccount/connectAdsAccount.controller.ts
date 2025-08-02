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

// for facebook connection

const redirectToFacebookOAuth = (req: Request, res: Response) => {
  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${
    config.facebookAppId
  }&redirect_uri=${encodeURIComponent(
    config.facebookRedirectUri
  )}&scope=business_management,pages_show_list&auth_type=rerequest`;
  console.log("Redirecting to Facebook OAuth:", authUrl);
  res.redirect(authUrl);
};

const handleFacebookCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string;
  if (!code) return res.status(400).send("Authorization code is missing");

  try {
    const accessToken = await connectAdsAccountservice.getFacebookAccessToken(
      code
    );

    FacebookAdsApi.init(accessToken);

    const user = new User("me");
    const adAccounts = await user.getAdAccounts();
    if (!adAccounts.length)
      return res.status(400).send("No ad accounts found.");


    const selectedAdAccount = adAccounts[0];

    return res.status(200).json({
      message: "✅ Facebook connected",
      accessToken,
      adAccountId: selectedAdAccount.id,
    });
  } catch (error: any) {
    console.error(
      "❌ Facebook OAuth error:",

      error.response?.data || error.message

    );
    return res.status(500).send("Failed to connect Facebook Ads account");
  }
};

const getFacebookAdsConnection = async (req: Request, res: Response) => {
  const userId = req.query.userId as string;

  // Example: fetch user's stored token from DB (replace with real DB call)
  const accessToken =
    "EAA7r59ZAbUhYBO8B7gUwInOrLDAkZCjbhba2AehRGYiGNmK1RUf2KMcPc6UFvM9tJlPO5eb9DOqjzmwu3Mhc6dj0BzBHVdP0RQF1JRFwrgPvFD3i503EXiK3GqUaqwdLSQ0JdVPn9CUlLgJLLNVIZBoCZBWeVXuhYvyQ1LJy4I5ZBZCXBrSA8tfmurqimJDFraQUCzyCs20YGRrpwC1U3mvBKBsJUsKVCUj2sLiaZBANIAWLukswZC6SekjdyQ2K";

  if (!accessToken) {
    return res.status(401).json({ connected: false, message: "Not connected" });
  }

  try {
    const adAccounts = await connectAdsAccountservice.getFacebookAdAccounts(
      accessToken
    );

    if (adAccounts && adAccounts.length > 0) {
      return res.status(200).json({ connected: true, adAccounts });
    } else {
      return res
        .status(200)
        .json({ connected: false, message: "No ad accounts found" });
    }
  } catch (error: any) {
    console.error("Failed to check ad accounts:", error.message);
    return res
      .status(500)
      .json({ connected: false, message: "Token invalid or expired" });
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

const handleLinkedInCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string;

  console.log("✅linkdin  Callback route hit");
  try {
    const accessToken = await connectAdsAccountservice.getLinkdinAccessToken(
      code
    );
    // Optionally: store accessToken in DB here
    res.json({ access_token: accessToken });
  } catch (error: any) {
    console.error("❌ Error getting access token:", error.message);
    res.status(500).json({ error: "Failed to retrieve access token" });
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
  getFacebookAdsConnection,
  redirectToLinkedIn,
  handleLinkedInCallback,

  getTiktokAuthUrl,
  handleTiktokCallback,
};

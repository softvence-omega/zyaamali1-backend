import express from "express";
import {
  connectAdsAccountController,
  getGoogleAdAccounts,
  googleAuthCallback,
  googleAuthRedirect,
} from "./connectAdsAccount.controller";

const router = express.Router();

// for facebook
router.get(
  "/facebook-auth",
  connectAdsAccountController.redirectToFacebookOAuth
);
router.get(
  "/facebook/callback",
  connectAdsAccountController.handleFacebookCallback
);
router.get(
  "/check-ads-status",
  connectAdsAccountController.getFacebookAdsConnection
);

// for instagram

router.get(
  "/instagram/connect",
  connectAdsAccountController.handleInstagramConnection
);

// for linkdin
router.get("/linkedin-auth", connectAdsAccountController.redirectToLinkedIn);
router.get(
  "/linkdin/callback",
  connectAdsAccountController.handleLinkedInCallback
);

// for google
router.get("/google-auth", googleAuthRedirect);
router.get("/google/callback", googleAuthCallback);
router.get("/ad-accounts", getGoogleAdAccounts);

// for tiktok
router.get("/tiktok-auth", connectAdsAccountController.getTiktokAuthUrl);
router.get(
  "/tiktok/callback",
  connectAdsAccountController.handleTiktokCallback
);

export const connectAdsAccountRoutes = router;


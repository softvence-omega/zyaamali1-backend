import express from "express";
import {
  connectAdsAccountController,
  getGoogleAdAccounts,
  getLinkedinAdAccounts,
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


// for instagram

router.get(
  "/instagram/connect",
  connectAdsAccountController.handleInstagramConnection
);

// for linkdin
router.get("/linkedin-auth", connectAdsAccountController.redirectToLinkedIn);
router.get(
  "/linkedin/callback",
  connectAdsAccountController.handleLinkedInCallback
);
router.get("/linkedin-ad-accounts", getLinkedinAdAccounts);

// for google
router.get("/google-auth", googleAuthRedirect);
router.get("/google/callback", googleAuthCallback);
router.get("/google-ad-accounts", getGoogleAdAccounts);

// for tiktok
router.get("/tiktok-auth", connectAdsAccountController.getTiktokAuthUrl);
router.get(
  "/tiktok/callback",
  connectAdsAccountController.handleTiktokCallback
);

export const connectAdsAccountRoutes = router;

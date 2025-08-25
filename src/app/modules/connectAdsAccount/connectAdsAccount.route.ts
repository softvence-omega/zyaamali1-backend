import express from "express";
import {
  connectAdsAccountController,
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

// for google
router.get("/google-auth", googleAuthRedirect);
router.get("/google/callback", googleAuthCallback);

// for tiktok
router.get("/tiktok-auth", connectAdsAccountController.getTiktokAuthUrl);
router.get(
  "/tiktok/callback",
  connectAdsAccountController.handleTiktokCallback
);


router.get(
  "/get-All-Data",
  connectAdsAccountController.getAllDataFromDB
);

export const connectAdsAccountRoutes = router;

import express from "express";
import {  connectAdsAccountController } from "./connectAdsAccount.controller";
import { connectAdsAccountservice } from "./connectAdsAccount.service";

const router = express.Router();

// for facebook 
router.get('/facebook-auth', connectAdsAccountController.redirectToFacebookOAuth);
router.get('/facebook/callback', connectAdsAccountController.handleFacebookCallback);
router.get('/check-ads-status', connectAdsAccountController.getFacebookAdsConnection);


// for instagram
router.get('/instagram/connect', connectAdsAccountController.handleInstagramConnection);


// for linkdin 

router.get('/linkedin-auth', connectAdsAccountController.redirectToLinkedIn);
router.get('/linkdin/callback', connectAdsAccountController.handleLinkedInCallback);


// for google 

router.get('/google-auth', connectAdsAccountController.getGoogleAuthURL);
router.get('/google/callback', connectAdsAccountController.handleGoogleCallback);





export const connectAdsAccountRoutes = router
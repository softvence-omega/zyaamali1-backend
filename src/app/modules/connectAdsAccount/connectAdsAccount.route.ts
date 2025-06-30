import express from "express";
import {  connectAdsAccountController } from "./connectAdsAccount.controller";
import { connectAdsAccountservice } from "./connectAdsAccount.service";

const router = express.Router();
router.get('/facebook-auth', connectAdsAccountController.redirectToFacebookOAuth);
router.get('/facebook/callback', connectAdsAccountController.handleFacebookCallback);
router.get('/check-ads-status', connectAdsAccountController.getFacebookAdsConnection);


// for instagram
router.get('/instagram/connect', connectAdsAccountController.handleInstagramConnection);

export const connectAdsAccountRoutes = router
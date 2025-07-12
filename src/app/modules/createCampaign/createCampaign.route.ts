import express from 'express';
import { createCampaignController } from './createCampaign.controller';

const router = express.Router();


router.post('/facebook/upload-image', createCampaignController.uploadImageController);
router.post('/facebook-ads', createCampaignController.createAdController);


// for google

router.post('/create-google-ad', createCampaignController.createGoogleCampaign);
router.get('/spend', createCampaignController.getGoogleCampaignSpend);



export const createCampaignRoute = router;

import express from 'express';
import { createCampaignController } from './createCampaign.controller';

const router = express.Router();


router.post('/facebook/upload-image', createCampaignController.uploadImageController);
router.post('/facebook-ads', createCampaignController.createAdController);


// for google

router.post('/create-google-ad', createCampaignController.createGoogleCampaign);
router.get('/spend', createCampaignController.getGoogleCampaignSpend);



export const createCampaignRoute = router;




// https://chatgpt.com/share/687219a5-5d3c-8008-aebb-f5e169914a45

import express from 'express';
import { createCampaignController } from './createCampaign.controller';

const router = express.Router();


router.post('/facebook/upload-image', createCampaignController.uploadImageController);
router.post('/facebook-ads', createCampaignController.createAdController);







export const createCampaignRoute = router;

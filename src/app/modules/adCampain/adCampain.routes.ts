
import express from "express";
import { adCampainController } from "./adCampain.controller";

import { adCampainPostValidation, adCampainUpdateValidation } from "./adCampain.validation";
import { validateRequest } from "../../middleWear/validateRequest";
import auth from "../../middleWear/auth";
import USER_ROLE from "../../constants/userRole";

const router = express.Router();

router.post("/post-ads-campaign",auth(USER_ROLE.ADMIN), adCampainController.postAdCampain);
router.get("/get-all-ads-campaign",auth(USER_ROLE.ADMIN, USER_ROLE.CREATOR, USER_ROLE.VIEWER), adCampainController.getAllAdCampain);
router.get("/get-single-ads-campaign/:id",auth(USER_ROLE.ADMIN, USER_ROLE.CREATOR, USER_ROLE.VIEWER), adCampainController.getSingleAdCampain);
router.get('/dashboard-summary', auth(USER_ROLE.ADMIN, USER_ROLE.CREATOR, USER_ROLE.VIEWER), adCampainController.getAdCampainsInfo)
router.put("/update-ads-campaign/:id", auth(USER_ROLE.ADMIN),adCampainController.updateAdCampain);
router.delete("/delete-ads-campaign/:id",auth(USER_ROLE.ADMIN), adCampainController.deleteAdCampain);


export const adCampainRoutes = router;
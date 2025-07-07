
import express from "express";
import { adCampainController } from "./adCampain.controller";
import auth from "../../middleWear/auth";
import USER_ROLE from "../../constants/userRole";


const router = express.Router();

router.post("/post-ads-campaign", auth(USER_ROLE.ADMIN, USER_ROLE.CREATOR), adCampainController.postAdCampain);
router.get("/get-all-ads-campaign", auth(USER_ROLE.ADMIN, USER_ROLE.CREATOR, USER_ROLE.VIEWER), adCampainController.getAllAdCampain);
router.get("/get-single-ads-campaign/:id", auth(USER_ROLE.ADMIN, USER_ROLE.CREATOR, USER_ROLE.VIEWER), adCampainController.getSingleAdCampain);
router.put("/update-ads-campaign/:id", auth(USER_ROLE.ADMIN, USER_ROLE.CREATOR), adCampainController.updateAdCampain);
router.delete("/delete-ads-campaign/:id", auth(USER_ROLE.ADMIN, USER_ROLE.CREATOR), adCampainController.deleteAdCampain);

export const adCampainRoutes = router;
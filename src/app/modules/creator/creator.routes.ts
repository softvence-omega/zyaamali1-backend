
import express from "express";
import { creatorController } from "./creator.controller";
import auth from "../../middleWear/auth";
import USER_ROLE from "../../constants/userRole";
import { upload } from "../../utils/sendFileToCloudinary";

const router = express.Router();

router.post("/post_creator",  auth(USER_ROLE.ADMIN), creatorController.postCreator);
router.get("/get_all_creator", auth(USER_ROLE.ADMIN), creatorController.getAllCreator);
router.get("/get_single_creator/:id", creatorController.getSingleCreator);
router.patch("/update_creator/:id", auth(USER_ROLE.ADMIN), creatorController.updateCreator);
router.delete("/delete_creator/:id", auth(USER_ROLE.ADMIN), creatorController.deleteCreator);
router.patch("/make_creator_active/:id", auth(USER_ROLE.ADMIN), creatorController.makeCreatorActive);
router.patch("/make_creator_inactive/:id", auth(USER_ROLE.ADMIN), creatorController.makeCreatorInactive);
export const creatorRoutes = router;
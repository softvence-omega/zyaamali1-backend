
import express from "express";
import { creatorController } from "./creator.controller";
import auth from "../../middleWear/auth";
import USER_ROLE from "../../constants/userRole";
import { upload } from "../../utils/sendFileToCloudinary";

const router = express.Router();

router.post("/post-creator",  auth(USER_ROLE.ADMIN), creatorController.postCreator);
router.get("/get-all-creator", auth(USER_ROLE.ADMIN), creatorController.getAllCreator);
router.get("/get-single-creator/:id",auth(USER_ROLE.ADMIN), creatorController.getSingleCreator);
router.patch("/update-creator/:id", auth(USER_ROLE.ADMIN), creatorController.updateCreator);
router.delete("/delete-creator/:id", auth(USER_ROLE.ADMIN), creatorController.deleteCreator);
router.patch("/make-creator-active/:id", auth(USER_ROLE.ADMIN), creatorController.makeCreatorActive);
router.patch("/make-creator-inactive/:id", auth(USER_ROLE.ADMIN), creatorController.makeCreatorInactive);
export const creatorRoutes = router;

import express from "express";
import { contentController } from "./content.controller";
import auth from "../../middleWear/auth";
import USER_ROLE from "../../constants/userRole";
import { upload } from "../../utils/sendFileToCloudinary";

const router = express.Router();

router.post("/post_premade_content", upload.single("file"), auth(USER_ROLE.SUPER_ADMIN), contentController.postPremadeContent);
router.get("/get_all_premade_content", auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN, USER_ROLE.CREATOR, USER_ROLE.VIEWER), contentController.getAllPremadeContent);
router.get("/get_single_premade_content/:id",auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN, USER_ROLE.CREATOR, USER_ROLE.VIEWER), contentController.getSinglePremadeContent);

export const contentRoutes = router;
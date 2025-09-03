import express from "express";

import { ChatbotHistoryController } from "./chatbotHistory.controller";
import USER_ROLES from "../../constants/userRole";
import auth from "../../middleWear/auth";

const router = express.Router();

router.post("/create" ,ChatbotHistoryController.saveChatbotHistory);
router.get("/get-all", ChatbotHistoryController.getChatbotHistory);
router.get("/get-single-history",auth(USER_ROLES.ADMIN,USER_ROLES.CREATOR,USER_ROLES.SUPER_ADMIN), ChatbotHistoryController.getSingleChatbotHistory);

export const chatbotHistoryRoute = router;

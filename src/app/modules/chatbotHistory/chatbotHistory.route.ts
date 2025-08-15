import express from "express";

import { ChatbotHistoryController } from "./chatbotHistory.controller";

const router = express.Router();

router.post("/create", ChatbotHistoryController.saveChatbotHistory);
router.get("/get-all", ChatbotHistoryController.getChatbotHistory);
router.get("/get-single-history", ChatbotHistoryController.getSingleChatbotHistory);

export const chatbotHistoryRoute = router;

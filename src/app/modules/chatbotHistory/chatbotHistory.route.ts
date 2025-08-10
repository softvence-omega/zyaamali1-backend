import express from "express";

import { ChatbotHistoryController } from "./chatbotHistory.controller";

const router = express.Router();

router.post("/create", ChatbotHistoryController.saveChatbotHistory);
router.get("/get-all", ChatbotHistoryController.getChatbotHistory);

export const chatbotHistoryRoute = router;

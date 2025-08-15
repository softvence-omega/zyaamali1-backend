import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ChatbotHistoryService } from "./chatbotHistory.service";

const saveChatbotHistory = catchAsync(async (req, res) => {
  const result = await ChatbotHistoryService.saveChatbotHistory(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "chatbot history save successfully.",
    data: result,
  });
});
const getChatbotHistory = catchAsync(async (req, res) => {
  const result = await ChatbotHistoryService.getChatbotHistory();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "get chatbot history .",
    data: result,
  });
});
const getSingleChatbotHistory = catchAsync(async (req, res) => {
  const { userId } = req.query;

  const result = await ChatbotHistoryService.getSingleChatbotHistory(
    userId as string
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "get chatbot history .",
    data: result,
  });
});

export const ChatbotHistoryController = {
  saveChatbotHistory,
  getChatbotHistory,
  getSingleChatbotHistory,
};

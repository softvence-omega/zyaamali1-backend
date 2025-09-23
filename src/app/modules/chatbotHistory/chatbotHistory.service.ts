import { chatbotHistoryModel } from "./chatbotHistory.model";
import { TChatbotHistory } from "./chatbotHistory.interface";

const saveChatbotHistory = async (payload: Partial<TChatbotHistory>) => {
  const user = await chatbotHistoryModel.create(payload);
  return user;
};

const getChatbotHistory = async () => {
  const result = await chatbotHistoryModel.find({})
  if (!result) {
    throw new Error("No chatbot history found");
  }
  return result;
};

const getSingleChatbotHistory = async (sessionId: string) => {


  const result = await chatbotHistoryModel
    .find({ sessionId: sessionId })
  if (!result) {
    throw new Error("No chatbot history found");
  }
  return result;
};

export const ChatbotHistoryService = {
  saveChatbotHistory,
  getChatbotHistory,
  getSingleChatbotHistory,
};

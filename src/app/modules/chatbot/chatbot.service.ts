
import { TChatbotHistory } from "./chatbot.interface";
import { chatbotModel } from "./chatbot.model";

const saveChatbotHistory = async (payload: Partial<TChatbotHistory>) => {
  const user = await chatbotModel.create(payload);
  return user;
};

const getChatbotHistory = async () => {
  const result = await chatbotModel.find({}).populate("userId");
  if (!result) {
    throw new Error("No chatbot history found");
  }
  return result;
};

const getSingleChatbotHistory = async (userId: string) => {
  const result = await chatbotModel
    .find({ userId: userId })
    .populate("userId");
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

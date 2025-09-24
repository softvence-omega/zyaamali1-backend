
import { TChatbotHistory } from "./chatbot.interface";
import { chatbotModel } from "./chatbot.model";

const saveChatbotHistory = async (payload: Partial<TChatbotHistory>) => {
  const user = await chatbotModel.create(payload);
  return user;
};

const getChatbotHistory = async () => {
  const result = await chatbotModel.find({}).populate("sessionId");
  if (!result) {
    throw new Error("No chatbot history found");
  }
  return result;
};

const getSingleChatbotHistory = async (sessionId: string) => {

  console.log('sessinon id form service ', sessionId)
  const result = await chatbotModel
    .find({sessionId:sessionId})
    console.log('result ', result)
   
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

import httpStatus from "http-status";
import { Conversation, Message } from "./conversation.model";
import { TMessage } from "./conversation.interface";
import ApiError from "../../errors/ApiError";

const createConversationIntoDB = async (id: string) => {
  const result = await Conversation.create({
    name: "New Conversation",
    userId: id,
  });

  return result;
};

const addAMessage = async (payload: TMessage) => {
  const result = await Message.create(payload);
  if (!result) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to create message"
    );
  }
  const conversation = await Conversation.findByIdAndUpdate(payload.chatId, {
    $push: { chat: result._id },
  });
  if (!conversation) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to create conversation"
    );
  }
  return result;
};

const getAllConversationsFromDB = async (id: string) => {
  const result = await Conversation.find({ userId: id }).select("name _id");
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "No conversations found");
  }
  return result;
};

const getMessagesFromConversationFromDB = async (conversationId: string) => {
  const conversation = await Conversation.findById(conversationId).populate({
    path: "chat",
    model: Message,
    populate: {
      path: "userId",
      select: "_id name email", // include relevant user fields
    },
  });
  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  return conversation;
};

const deleteConversationFromDB = async (id: string) => {
  const existing = await Conversation.findById(id);
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Conversation not found");
  }
  await Conversation.findByIdAndDelete(id);
};

const changeConversationNameIntoDB = async (id: string, name: string) => {
  const existing = await Conversation.findByIdAndUpdate(id, { name });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Conversation not found");
  }
  await Conversation.findOneAndDelete({ chatId: id });
};

export const conversationService = {
  createConversationIntoDB,
  addAMessage,
  getAllConversationsFromDB,
  getMessagesFromConversationFromDB,
  deleteConversationFromDB,
  changeConversationNameIntoDB,
};

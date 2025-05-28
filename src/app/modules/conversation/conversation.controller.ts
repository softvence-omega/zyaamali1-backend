import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { conversationService } from "./conversation.service";

const createConversartion = catchAsync(async (req: Request, res: Response) => {
  const result = await conversationService.createConversationIntoDB(
    req.loggedInUser.userId,
    req.body.model

  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Conversation created successfully",
    data: result,
  });
});

const addAMessage = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.loggedInUser;
  const result = await conversationService.addAMessage({
    userId,
    ...req.body,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Message added successfully",
    data: result,
  });
});

const getAllConversations = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.loggedInUser;
  const result = await conversationService.getAllConversationsFromDB(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Conversations fetched successfully",
    data: result,
  });
});

const getMessagesFromConversation = catchAsync(
  async (req: Request, res: Response) => {
    const { conversationId } = req.params;
    const result = await conversationService.getMessagesFromConversationFromDB(
      conversationId
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Messages fetched successfully",
      data: result,
    });
  }
);

const deleteConversation = catchAsync(async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  await conversationService.deleteConversationFromDB(conversationId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Conversation deleted successfully",
    data: null,
  });
});

const changeConversationName = catchAsync(
  async (req: Request, res: Response) => {
    const { conversationId } = req.params;
    const result = await conversationService.changeConversationNameIntoDB(
      conversationId,
      req.body.name
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Conversation name changed successfully",
      data: result,
    });
  }
);

export const conversationController = {
  getAllConversations,
  createConversartion,
  addAMessage,
  getMessagesFromConversation,
  deleteConversation,
  changeConversationName,
};

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
    message: "A new conversation has been successfully created.",
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
    message: "Your message has been added to the conversation.",
    data: result,
  });
});

const getAllConversations = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.loggedInUser;
  const result = await conversationService.getAllConversationsFromDB(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All your conversations have been retrieved successfully.",
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
      message: "Messages from the conversation have been fetched successfully.",
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
    message: "The conversation has been deleted successfully.",
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
      message: "The conversation name has been updated successfully.",
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

import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { conversationService } from "./conversation.service";
import { TContent } from "./conversation.interface";
import { sendFileToCloudinary } from "../../utils/sendFileToCloudinary";

const createConversartion = catchAsync(async (req: Request, res: Response) => {
  const result = await conversationService.createConversationIntoDB(
    req.user.userId
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Conversation created successfully",
    data: result,
  });
});

const addAMessage = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const files = req.files as {
    promptFile?: Express.Multer.File[];
    responseFile?: Express.Multer.File[];
  };
  const { prompt, response, chatId } = req.body;

  let parsedPrompt: TContent = JSON.parse(prompt);
  let parsedResponse: TContent = JSON.parse(response);

  if (files?.promptFile?.[0] && parsedPrompt.type !== "text") {
    const uploaded = (await sendFileToCloudinary(
      files.promptFile[0].filename,
      files.promptFile[0].path,
      parsedPrompt.type
    )) as { secure_url: string };
    parsedPrompt.content = uploaded.secure_url;
  }

  if (files?.responseFile?.[0] && parsedResponse.type !== "text") {
    const uploaded = (await sendFileToCloudinary(
      files.responseFile[0].filename,
      files.responseFile[0].path,
      parsedResponse.type
    )) as { secure_url: string };
    parsedResponse.content = uploaded.secure_url;
  }

  const result = await conversationService.addAMessage({
    userId,
    chatId,
    prompt: parsedPrompt,
    response: parsedResponse,
  });
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Conversation created successfully",
    data: result,
  });
});

const getAllConversations = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
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
    const result =
      await conversationService.getMessagesFromConversationFromDB(
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

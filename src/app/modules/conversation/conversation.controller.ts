import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { conversationService } from "./conversation.service";
import { sendFileToCloudinary } from "../../utils/sendFileToCloudinary";
import { TPrompt, TResponse } from "./conversation.interface";

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
  console.log(files);
  const { prompt, response, chatId } = req.body;

  let parsedPrompt: TPrompt[] = JSON.parse(prompt);
  let parsedResponse: TResponse[] = JSON.parse(response);

  // Upload prompt files to cloud and assign URLs
  if (files?.promptFile && files.promptFile.length > 0) {
    let promptFileIndex = 0;
    for (let i = 0; i < parsedPrompt.length; i++) {
      const item = parsedPrompt[i];
      if (item.type !== "text") {
        const file = files.promptFile[promptFileIndex++];
        // promptFileIndex++;
        if (file) {
          const uploaded = (await sendFileToCloudinary(
            file.filename,
            file.path,
            item.type
          )) as { secure_url: string };
          item.content = uploaded.secure_url;
        }
      }
    }
  }

  // Upload response files to cloud and assign URLs
  if (files?.responseFile && files.responseFile.length > 0) {
    let responseFileIndex = 0;
    for (let i = 0; i < parsedResponse.length; i++) {
      const item = parsedResponse[i];
      if (item.type !== "text" && item.type !== "card") {
        const file = files.responseFile[responseFileIndex++];
        // responseFileIndex++;
        if (file) {
          const uploaded = (await sendFileToCloudinary(
            file.filename,
            file.path,
            item.type
          )) as { secure_url: string };
          item.content = uploaded.secure_url;
        }
      }
    }
  }
  console.log("parsed Prompt -> ", parsedPrompt);
  console.log("parsed Response -> ", parsedResponse);
  const result = await conversationService.addAMessage({
    userId,
    chatId,
    prompt: parsedPrompt,
    response: parsedResponse,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Message added successfully",
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

import { Request, Response } from "express";
import { creatorService } from "./creator.service";
import sendResponse from "../../utils/sendResponse";
import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";

const postCreator = catchAsync(async (req: Request, res: Response) => {
  const result = await creatorService.postCreatorIntoDB(req.body);
  sendResponse(res, { statusCode: status.CREATED, success: true, message: "Created successfully", data: result });
});

const getAllCreator = catchAsync(async (req: Request, res: Response) => {
  const result = await creatorService.getAllCreatorFromDB(req.query);
  sendResponse(res, { statusCode: status.OK, success: true, message: "Fetched successfully", data: result });
});

const getSingleCreator = catchAsync(async (req: Request, res: Response) => {
  const result = await creatorService.getSingleCreatorFromDB(req.params.id);
  sendResponse(res, { statusCode: status.OK, success: true, message: "Fetched successfully", data: result });
});

const updateCreator = catchAsync(async (req: Request, res: Response) => {
  const result = await creatorService.updateCreatorIntoDB(req.params.id, req.body);
  sendResponse(res, { statusCode: status.OK, success: true, message: "Updated successfully", data: result });
});

const deleteCreator = catchAsync(async (req: Request, res: Response) => {
  await creatorService.deleteCreatorFromDB(req.params.id);
  sendResponse(res, { statusCode: status.OK, success: true, message: "Deleted successfully", data: null });
});

const makeCreatorActive = catchAsync(async (req: Request, res: Response) => {
  const result = await creatorService.makeCreatorActive(req.params.id);
  sendResponse(res, { statusCode: status.OK, success: true, message: "Creator activated successfully", data: result });
});

const makeCreatorInactive = catchAsync(async (req: Request, res: Response) => {
  const result = await creatorService.makeCreatorInactive(req.params.id);
  sendResponse(res, { statusCode: status.OK, success: true, message: "Creator deactivated successfully", data: result });
});


export const creatorController = { postCreator, getAllCreator, getSingleCreator, updateCreator, deleteCreator, makeCreatorActive, makeCreatorInactive };

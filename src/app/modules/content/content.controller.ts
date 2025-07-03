import { Request, Response } from "express";
import { contentService } from "./content.service";
import sendResponse from "../../utils/sendResponse";
import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";

const postPremadeContent = catchAsync(async (req: Request, res: Response) => {

  const contentData = JSON.parse(req.body.data);
  // console.log(contentData, "contentData");
  const result = await contentService.postPremadeContentIntoDB(contentData, req.file);
  sendResponse(res, { statusCode: status.CREATED, success: true, message: "Created successfully", data: result });
});

const getAllPremadeContent = catchAsync(async (req: Request, res: Response) => {
  const result = await contentService.getAllPremadeContentFromDB(req.query);
  sendResponse(res, { statusCode: status.OK, success: true, message: "Fetched successfully", data: result });
});

const getSinglePremadeContent = catchAsync(async (req: Request, res: Response) => {
  const result = await contentService.getSinglePremadeContentFromDB(req.params.id);
  sendResponse(res, { statusCode: status.OK, success: true, message: "Fetched successfully", data: result });
});



export const contentController = { postPremadeContent, getAllPremadeContent, getSinglePremadeContent};

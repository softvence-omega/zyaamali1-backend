import { Request, Response } from "express";
import { adCampainService } from "./adCampain.service";
import sendResponse from "../../utils/sendResponse";
import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

const postAdCampain = catchAsync(async (req: Request, res: Response) => {

  const createdBy = req.loggedInUser.userId;


  const result = await adCampainService.postAdCampainIntoDB({ ...req.body, createdBy });

  sendResponse(res, { statusCode: status.CREATED, success: true, message: "Created successfully", data: result });
});

const getAllAdCampain = catchAsync(async (req: Request, res: Response) => {
  const createdBy = req.loggedInUser.userId
  const result = await adCampainService.getAllAdCampainFromDB(req.query, createdBy);
  sendResponse(res, { statusCode: status.OK, success: true, message: "Fetched successfully", data: result });
});

const getSingleAdCampain = catchAsync(async (req: Request, res: Response) => {
  const result = await adCampainService.getSingleAdCampainFromDB(req.params.id);
  sendResponse(res, { statusCode: status.OK, success: true, message: "Fetched successfully", data: result });
});

const getAdCampainsInfo = catchAsync(async (req: Request, res: Response) => {
  const result = await adCampainService.getAdDashboardSummary(req.loggedInUser.userId)
  sendResponse(res, { statusCode: status.OK, success: true, message: "Fetched successfully", data: result });
})

const updateAdCampain = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id
  const result = await adCampainService.updateAdCampainIntoDB(req.body, id);
  sendResponse(res, { statusCode: status.OK, success: true, message: "Updated successfully", data: result });
});

const deleteAdCampain = catchAsync(async (req: Request, res: Response) => {
  await adCampainService.deleteAdCampaignFromDB(req.params.id);
  sendResponse(res, { statusCode: status.OK, success: true, message: "Deleted successfully", data: null });
});


export const adCampainController = { postAdCampain, getAllAdCampain, getSingleAdCampain, updateAdCampain, deleteAdCampain ,getAdCampainsInfo};

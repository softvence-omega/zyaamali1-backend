import { Request, Response } from "express";
import { reportsService } from "./reports.service";
import sendResponse from "../../utils/sendResponse";
import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";

const postReports = catchAsync(async (req: Request, res: Response) => {
  const result = await reportsService.postReportsIntoDB(req.body);
  sendResponse(res, { statusCode: status.CREATED, success: true, message: "Created successfully", data: result });
});

const getAllCampaignReport = catchAsync(async (req: Request, res: Response) => {
  const userId = req.loggedInUser.userId;
const result = await reportsService.getAllCampaignReportsFromDB(userId)
    
  
  sendResponse(res, { statusCode: status.OK, success: true, message: "Fetched successfully", data: null });
});

const getSingleReports = catchAsync(async (req: Request, res: Response) => {
  const result = await reportsService.getSingleReportsFromDB(req.params.id);
  sendResponse(res, { statusCode: status.OK, success: true, message: "Fetched successfully", data: result });
});

const updateReports = catchAsync(async (req: Request, res: Response) => {
  const result = await reportsService.updateReportsIntoDB(req.body);
  sendResponse(res, { statusCode: status.OK, success: true, message: "Updated successfully", data: result });
});

const deleteReports = catchAsync(async (req: Request, res: Response) => {
  await reportsService.deleteReportsFromDB(req.params.id);
  sendResponse(res, { statusCode: status.OK, success: true, message: "Deleted successfully", data: null });
});


export const reportsController = { postReports, getAllCampaignReport, getSingleReports, updateReports, deleteReports };

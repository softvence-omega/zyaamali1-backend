import { Request, Response } from "express";
import { viewerService } from "./viewer.service";
import sendResponse from "../../utils/sendResponse";
import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";

const postViewer = catchAsync(async (req: Request, res: Response) => {
  const result = await viewerService.postViewerIntoDB(req.body);
  sendResponse(res, { statusCode: status.CREATED, success: true, message: "Created successfully", data: result });
});

const getAllViewer = catchAsync(async (req: Request, res: Response) => {
  const result = await viewerService.getAllViewerFromDB(req.query);
  sendResponse(res, { statusCode: status.OK, success: true, message: "Fetched successfully", data: result });
});

const getSingleViewer = catchAsync(async (req: Request, res: Response) => {
  const result = await viewerService.getSingleViewerFromDB(req.params.id);
  sendResponse(res, { statusCode: status.OK, success: true, message: "Fetched successfully", data: result });
});

const updateViewer = catchAsync(async (req: Request, res: Response) => {
  // console.log("Update daat body: ",req.body);
  const result = await viewerService.updateViewerIntoDB(req.params.id, req.body);
  sendResponse(res, { statusCode: status.OK, success: true, message: "Updated successfully", data: result });
});

const deleteViewer = catchAsync(async (req: Request, res: Response) => {
  await viewerService.deleteViewerFromDB(req.params.id);
  sendResponse(res, { statusCode: status.OK, success: true, message: "Deleted successfully", data: null });
});

const makeViewerActive = catchAsync(async (req: Request, res: Response) => {
  const result = await viewerService.makeViewerActive(req.params.id);
  sendResponse(res, { statusCode: status.OK, success: true, message: "Viewer activated successfully", data: result });
});

const makeViewerInactive = catchAsync(async (req: Request, res: Response) => {
  const result = await viewerService.makeViewerInactive(req.params.id);
  sendResponse(res, { statusCode: status.OK, success: true, message: "Viewer deactivated successfully", data: result });
});



export const viewerController = { postViewer, getAllViewer, getSingleViewer, updateViewer, deleteViewer, makeViewerActive, makeViewerInactive };

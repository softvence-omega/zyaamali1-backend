import { Request, Response } from "express";
import { configureService } from "./configure.service";
import sendResponse from "../../utils/sendResponse";
import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";

const getAllConfigure = catchAsync(async (req: Request, res: Response) => {
  const result = await configureService.getAllConfigureFromDB(req.query);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "All configuration settings retrieved successfully.",
    data: result,
  });
});

const getSingleConfigure = catchAsync(async (req: Request, res: Response) => {
  const result = await configureService.getSingleConfigureFromDB(req.params.id);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Configuration setting retrieved successfully.",
    data: result,
  });
});

const updateConfigure = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await configureService.updateConfigureIntoDB({
    ...req.body,
    id,
  });
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Configuration setting updated successfully.",
    data: result,
  });
});

export const configureController = {
  getAllConfigure,
  getSingleConfigure,
  updateConfigure,
};

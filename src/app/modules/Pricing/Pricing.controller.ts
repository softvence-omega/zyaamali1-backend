import { Request, Response } from "express";
import { PricingService } from "./Pricing.service";
import sendResponse from "../../utils/sendResponse";
import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";

const postPricing = catchAsync(async (req: Request, res: Response) => {
  const result = await PricingService.postPricingIntoDB(req.body);
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "New pricing plan has been created successfully.",
    data: result,
  });
});

const getAllPricing = catchAsync(async (req: Request, res: Response) => {
  const result = await PricingService.getAllPricingFromDB(req.query);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "All pricing plans retrieved successfully.",
    data: result,
  });
});

const getSinglePricing = catchAsync(async (req: Request, res: Response) => {
  const result = await PricingService.getSinglePricingFromDB(req.params.id);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Pricing plan details retrieved successfully.",
    data: result,
  });
});

const updatePricing = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PricingService.updatePricingIntoDB({ ...req.body, id });
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Pricing plan updated successfully.",
    data: result,
  });
});

const deletePricing = catchAsync(async (req: Request, res: Response) => {
  await PricingService.deletePricingFromDB(req.params.id);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Pricing plan deleted successfully.",
    data: null,
  });
});

export const PricingController = {
  postPricing,
  getAllPricing,
  getSinglePricing,
  updatePricing,
  deletePricing,
};

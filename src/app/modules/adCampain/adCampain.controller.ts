import { Request, Response } from "express";
    import { adCampainService } from "./adCampain.service";
    import catchAsync from "../../utils/catchAsync";
    import sendResponse from "../../utils/sendResponse";
    import status from "http-status";
    
    const postAdCampain = catchAsync(async (req: Request, res: Response) => {
      const result = await adCampainService.postAdCampainIntoDB(req.body);
      sendResponse(res, { statusCode: status.CREATED, success: true, message: "Created successfully", data: result });
    });
    
    const getAllAdCampain = catchAsync(async (req: Request, res: Response) => {
      const result = await adCampainService.getAllAdCampainFromDB(req.query);
      sendResponse(res, { statusCode: status.OK, success: true, message: "Fetched successfully", data: result });
    });
    
    const getSingleAdCampain = catchAsync(async (req: Request, res: Response) => {
      const result = await adCampainService.getSingleAdCampainFromDB(req.params.id);
      sendResponse(res, { statusCode: status.OK, success: true, message: "Fetched successfully", data: result });
    });
    
    const updateAdCampain = catchAsync(async (req: Request, res: Response) => {
      const result = await adCampainService.updateAdCampainIntoDB(req.body);
      sendResponse(res, { statusCode: status.OK, success: true, message: "Updated successfully", data: result });
    });
    
    const deleteAdCampain = catchAsync(async (req: Request, res: Response) => {
      await adCampainService.deleteAdCampainFromDB(req.params.id);
      sendResponse(res, { statusCode: status.OK, success: true, message: "Deleted successfully",data: null });
    });

    
    export const adCampainController = { postAdCampain, getAllAdCampain, getSingleAdCampain, updateAdCampain, deleteAdCampain };
    
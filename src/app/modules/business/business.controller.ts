import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { BusinessService } from "./business.service";

const postBusiness = catchAsync(async (req: Request, res: Response) => {
    const result = await BusinessService.addBusiness({
        ...req.body,
        
    });
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Created successfully",
        data: result,
    });
});


export const businessController = {
    postBusiness,
};
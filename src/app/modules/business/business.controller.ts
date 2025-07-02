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
const getAllBusiness = catchAsync(async (req: Request, res: Response) => {
    const result = await BusinessService.getAllBusiness();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Business fetched successfully",
        data: result,
    });
});

const updateBusiness = catchAsync(async (req: Request, res: Response) => {
    const result = await BusinessService.updateBusiness(req.params.id, req.body);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Business updated successfully",
        data: result,
    });
});


const deleteBusiness = catchAsync(async (req: Request, res: Response) => {
    const result = await BusinessService.deleteBusiness(req.params.id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Business deleted successfully",
        data: "",
    });
});


export const businessController = {
    postBusiness,
    getAllBusiness,
    updateBusiness, deleteBusiness
};
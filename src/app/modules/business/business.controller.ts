import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { BusinessService } from "./business.service";

const postBusiness = catchAsync(async (req: Request, res: Response) => {
    const result = await BusinessService.addBusiness({
        ...req.body,
        createdBy: req.loggedInUser.userId, // Assuming req.loggedInUser is set by auth middleware

    });
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Created successfully",
        data: result,
    });
});
const getAllBusiness = catchAsync(async (req: Request, res: Response) => {
    const result = await BusinessService.getAllBusiness(req.loggedInUser.userId,req.query);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Business fetched successfully",
        data: result,
    });
});

const updateBusiness = catchAsync(async (req: Request, res: Response) => {
    const businessData = {
        ...req.body,
    }
    const result = await BusinessService.updateBusiness(req.loggedInUser.userId,req.params.id, businessData);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Business updated successfully",
        data: result,
    });
});


const deleteBusiness = catchAsync(async (req: Request, res: Response) => {
    const result = await BusinessService.deleteBusiness(req.params.id, req.loggedInUser.userId);
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
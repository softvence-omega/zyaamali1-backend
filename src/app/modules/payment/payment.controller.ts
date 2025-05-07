import { Request, Response } from "express";
    import { paymentService } from "./payment.service";
    import sendResponse from "../../utils/sendResponse";
    import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";
    
    const createCheckoutSession = catchAsync(async (req: Request, res: Response) => {
      const result = await paymentService.createCheckoutSessionIntoDB(req.body);
      sendResponse(res, { statusCode: status.CREATED, success: true, message: "Created checkout session successfully", data: result });
    });
    const postPayment = catchAsync(async (req: Request, res: Response) => {
      const result = await paymentService.postPaymentIntoDB(req.body);
      sendResponse(res, { statusCode: status.CREATED, success: true, message: "Created successfully", data: result });
    });
    
    const getAllPayment = catchAsync(async (req: Request, res: Response) => {
      const result = await paymentService.getAllPaymentFromDB(req.query);
      sendResponse(res, { statusCode: status.OK, success: true, message: "Fetched successfully", data: result });
    });
    
    const getSinglePayment = catchAsync(async (req: Request, res: Response) => {
      const result = await paymentService.getSinglePaymentFromDB(req.params.id);
      sendResponse(res, { statusCode: status.OK, success: true, message: "Fetched successfully", data: result });
    });
    
    const updatePayment = catchAsync(async (req: Request, res: Response) => {
      const result = await paymentService.updatePaymentIntoDB(req.body);
      sendResponse(res, { statusCode: status.OK, success: true, message: "Updated successfully", data: result });
    });
    
    const deletePayment = catchAsync(async (req: Request, res: Response) => {
      await paymentService.deletePaymentFromDB(req.params.id);
      sendResponse(res, { statusCode: status.OK, success: true, message: "Deleted successfully",data: null });
    });

    
    export const paymentController = { postPayment, getAllPayment, getSinglePayment, updatePayment, deletePayment,createCheckoutSession };
    
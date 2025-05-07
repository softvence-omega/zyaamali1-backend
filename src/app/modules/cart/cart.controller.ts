import { Request, Response } from "express";
import { cartService } from "./cart.service";
import sendResponse from "../../utils/sendResponse";
import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";

const postCart = catchAsync(async (req: Request, res: Response) => {
  const {userId} = req.user
  const result = await cartService.postCartIntoDB({...req.body, userId});
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Created successfully",
    data: result,
  });
});

const getAllCart = catchAsync(async (req: Request, res: Response) => {
  const {userId} = req.user

  const result = await cartService.getAllCartFromDB(req.query, userId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Fetched successfully",
    data: result,
  });
});

const getSingleCart = catchAsync(async (req: Request, res: Response) => {
  const {userId} = req.user

  const result = await cartService.getSingleCartFromDB(req.params.id, userId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Fetched successfully",
    data: result,
  });
});

const updateCart = catchAsync(async (req: Request, res: Response) => {
  const {userId} = req.user
  const {id} = req.params;

  const result = await cartService.updateCartIntoDB(req.body, id, userId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Updated successfully",
    data: result,
  });
});

const deleteCart = catchAsync(async (req: Request, res: Response) => {
  const {userId} = req.user

  await cartService.deleteCartFromDB(req.params.id, userId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Deleted successfully",
    data: null,
  });
});

export const cartController = {
  postCart,
  getAllCart,
  getSingleCart,
  updateCart,
  deleteCart,
};

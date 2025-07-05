import { UserServices } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";


const getAllUsers = catchAsync(async (req, res) => {
  const result = await UserServices.getAllUsersFromDB(req.query); // pass query params
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All users retrieved successfully.",
    data: {
      result: result.data,
      meta: {
        page: result.meta.page,
        limit: result.meta.limit,
        totalPages: result.meta.totalPage,
        totalResults: result.meta.total,
      }
    },
  });
});

const getSingleUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserServices.getSingleUserFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User details retrieved successfully.",
    data: result,
  });
});

const getMe = catchAsync(async (req, res) => {
  const result = await UserServices.getMeFromDB(req.loggedInUser);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Authenticated user information retrieved successfully.",
    data: result,
  });
});

const createAUser = catchAsync(async (req, res) => {

  const result = await UserServices.createAUserIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User register successfully.",
    data: result,
  });
});

const uploadImage = catchAsync(async (req, res) => {
  const result = await UserServices.uploadImageIntoDB(
    req.loggedInUser,
    req.file
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile image updated successfully.",
    data: result,
  });
});


const updateProfile = catchAsync(async (req, res) => {
  const result = await UserServices.updateProfile(req.loggedInUser.userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile updated successfully.",
    data: result,
  });
});











export const UserControllers = {
  getSingleUser,
  getMe,
  getAllUsers,
  createAUser,
  uploadImage,
  updateProfile
};

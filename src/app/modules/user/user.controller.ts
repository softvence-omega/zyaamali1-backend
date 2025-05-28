import { UserServices } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";

const getAllUsers = catchAsync(async (req, res) => {
  const result = await UserServices.getAllUsersFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieved successfully",
    data: result,
  });
});

const getSingleUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserServices.getSingleUserFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User data retrieved successfully",
    data: result,
  });
});

const getMe = catchAsync(async (req, res) => {
  const result = await UserServices.getMeFromDB(req.loggedInUser);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My information retrieved successfully",
    data: result,
  });
});

const createAUser = catchAsync(async (req, res) => {
  const result = await UserServices.createAUserIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User created successfully",
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
    message: "Image updated successfully",
    data: result,
  });
});

const changeUserLanguage = catchAsync(async (req, res) => {
  const result = await UserServices.changeUserLanguage(
    req.loggedInUser,
    req.body.language
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User language updated successfully",
    data: result,
  });
});

const changeUserTheme = catchAsync(async (req, res) => {
  const result = await UserServices.changeUserTheme(
    req.loggedInUser,
    req.body.theme
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User theme updated successfully",
    data: result,
  });
});

const toggleUserDelete = catchAsync(async (req, res) => {
  const result = await UserServices.toggleUserDeleteInDB(
    req.params.id,
    req.body.deleted
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User deleted successfully",
    data: result,
  });
});

export const UserControllers = {
  getSingleUser,
  getMe,
  getAllUsers,
  createAUser,
  changeUserLanguage,
  changeUserTheme,
  uploadImage,
  toggleUserDelete,
};

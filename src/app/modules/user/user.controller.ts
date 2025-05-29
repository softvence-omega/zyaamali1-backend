import { UserServices } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";

const getAllUsers = catchAsync(async (req, res) => {
  const result = await UserServices.getAllUsersFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All users retrieved successfully.",
    data: result,
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
    message: "New user created successfully.",
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

const changeUserLanguage = catchAsync(async (req, res) => {
  const result = await UserServices.changeUserLanguage(
    req.loggedInUser,
    req.body.language
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Preferred language updated successfully.",
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
    message: "Theme preference updated successfully.",
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
    message: req.body.deleted
      ? "User marked as deleted successfully."
      : "User restored successfully.",
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

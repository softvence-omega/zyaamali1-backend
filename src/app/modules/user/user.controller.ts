import httpStatus from "http-status";

import sendResponse from "../../utils/sendResponse";
import { UserServices } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";

const getAllUsers = catchAsync(async (req, res) => {
  try {
    const result = await UserServices.getAllUsersFromDB(req.query);

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
        },
      },
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      success: false,
      message: "Failed to fetch users.",
      data: error.message,
    });
  }
});

const getSingleUser = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const result = await UserServices.getSingleUserFromDB(id);

    if (!result) {
      return sendResponse(res, {
        statusCode: httpStatus.NOT_FOUND,
        success: false,
        message: "User not found.",
        data: null,
      });
    }

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User details retrieved successfully.",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      success: false,
      message: "Failed to fetch user.",
      data: error.message,
    });
  }
});

const getMe = catchAsync(async (req, res) => {
  try {
    const result = await UserServices.getMeFromDB(req.loggedInUser);

    if (!result) {
      return sendResponse(res, {
        statusCode: httpStatus.NOT_FOUND,
        success: false,
        message: "Authenticated user not found.",
        data: null,
      });
    }

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Authenticated user information retrieved successfully.",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      success: false,
      message: "Failed to fetch authenticated user.",
      data: error.message,
    });
  }
});

const createAUser = catchAsync(async (req, res) => {
  try {
    const result = await UserServices.createAUserIntoDB(req.body);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "User registered successfully.",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: error.message || "User registration failed.",
      data: null,
    });
  }
});

const uploadImage = catchAsync(async (req, res) => {
  try {
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
  } catch (error: any) {
    sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Image upload failed.",
      data: error.message,
    });
  }
});

const updateProfile = catchAsync(async (req, res) => {
  try {

    console.log("req.body", req.body);
    const result = await UserServices.updateProfile(
      req.loggedInUser.userId,
      req.body
    );



    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Profile updated successfully.",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Profile update failed.",
      data: error.message,
    });
  }
});

const deleteProfile = catchAsync(async (req, res) => {
  try {
    const result = await UserServices.deleteProfile(req.loggedInUser.userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Profile deleted successfully.",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      success: false,
      message: "Profile deletion failed.",
      data: error.message,
    });
  }
});

export const UserControllers = {
  getAllUsers,
  getSingleUser,
  getMe,
  createAUser,
  uploadImage,
  updateProfile,
  deleteProfile,
};

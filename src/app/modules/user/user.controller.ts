import { generateVerificationCode, UserServices } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { User } from "./user.model";
import ApiError from "../../errors/ApiError";
import config from "../../config";
import { createToken } from "../auth/auth.utils";

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
    message: "User created successfully. Please check your email for verification.",
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


const verifyEmail = catchAsync(async (req, res) => {
  const { email, code } = req.body;

  const user: any = await User.findOne({
    email,
    verificationCode: code,
  })

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "Invalid email or verification code");

  }

  if (user.isVerified) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email is already verified")
  }

  if (user.verificationCode !== code || new Date() > user.verificationCodeExpiresAt) {
    throw new ApiError(httpStatus.FORBIDDEN, "Invalid or expired verification code")
  }

  user.isVerified = true;
  user.verificationCode = null;
  user.verificationCodeExpiresAt = null;
  await user.save();

  const jwtPayload = { userId: user._id.toString(), role: user.role };
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    parseInt(config.jwt_access_expires_in as string)
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Email verified successfully",
    data: { accessToken },
  });
})
const resendVerificationCode = catchAsync(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

  if (user.isVerified) throw new ApiError(httpStatus.BAD_REQUEST, "User already verified");

  const now = new Date();
  const lastSent = user.lastVerificationSentAt || new Date(0);
  const oneDayLater = new Date(lastSent.getTime() + 24 * 60 * 60 * 1000);

  if (now < oneDayLater) {
    throw new ApiError(httpStatus.TOO_MANY_REQUESTS, "You can request a new code once every 24 hours");
  }

  user.verificationCode = generateVerificationCode();
  user.verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  user.lastVerificationSentAt = now;
  await user.save();

  // TODO: Send email with new code

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Verification code resent",
    data: null
  });



});


export const UserControllers = {
  getSingleUser,
  verifyEmail,
  getMe,
  resendVerificationCode,
  getAllUsers,
  createAUser,
  changeUserLanguage,
  changeUserTheme,
  uploadImage,
  toggleUserDelete,
};

import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AuthServices } from "./auth.service";
import config from "../../config";
import { createToken } from "./auth.utils";

const loginUser = catchAsync(async (req, res) => {
  if (!req.body?.email || !req.body?.password) {
    throw new Error("Email and password are required");
  }

  const result = await AuthServices.loginUser(req.body);
  console.log(result);

  if (!result) {
    throw new Error("Invalid login credentials");
  }

  const { refreshToken, ...data } = result;

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: config.node_env === "production" ? true : false,
    sameSite: config.node_env === "production" ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Login successful",
    data,
  });
});

const googleCallback = catchAsync(async (req, res) => {
  const user = req.user as any;
  if (!user) {
    throw new Error("Google authentication failed");
  }

  const jwtPayload = {
    userId: user._id.toString(),
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret!,
    parseInt(config.jwt_access_expires_in!)
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret!,
    parseInt(config.jwt_refresh_expires_in!)
  );

  res.cookie("refreshToken", refreshToken, {
    secure: config.node_env === "production",
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Login successful",
    data: { accessToken },
  });
});

const changePassword = catchAsync(async (req, res) => {
  if (!req.loggedInUser) {
    throw new Error("Unauthorized: No logged-in user found");
  }

  const result = await AuthServices.changePassword(req.loggedInUser, req.body);
  if (!result) {
    throw new Error("Password change failed");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password is updated successfully",
    data: result,
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    throw new Error("No refresh token found in cookies");
  }

  const result = await AuthServices.refreshToken(refreshToken);
  if (!result) {
    throw new Error("Invalid refresh token");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Access token is refreshed successfully!",
    data: result,
  });
});

const forgetPassword = catchAsync(async (req, res) => {
  if (!req.body?.email) {
    throw new Error("Email is required for password reset");
  }

  const result = await AuthServices.forgetPassword(req.body.email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reset link is sent to client's mail successfully!",
    data: result,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const token = req.headers.authorization as string;
  if (!token) {
    throw new Error("Authorization token is missing");
  }

  const result = await AuthServices.resetPassword(req.body, token);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password has been reset successfully!",
    data: result,
  });
});

export const AuthControllers = {
  loginUser,
  googleCallback,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword,
};

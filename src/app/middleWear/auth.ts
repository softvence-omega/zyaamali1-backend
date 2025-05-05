import httpStatus from "http-status";
import { catchAsync } from "../utils/catchAsync";
import { JwtPayload } from "jsonwebtoken";
import config from "../config";
import { TUserRole } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import ApiError from "../errors/ApiError";
import { verifyToken } from "../modules/auth/auth.utils";

const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req, res, next) => {
    const token = req.headers.authorization;

    //Check if token is sent
    if (!token) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Token not found: Unauthorized User!"
      );
    }

    // If token found, then verify token and find out decoded jwtPayload fields
    let decoded;
    try {
      decoded = verifyToken(token, config.jwt_access_secret as string);
    } catch (error) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Unauthorized access happened"
      );
    }
    console.log(decoded);
    const { userId, role, iat } = decoded;
    const user = await User.findById(userId);

    // Check if user exists
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
    }

    // Check if user is deleted
    const isUserDeleted = user?.isDeleted;
    if (isUserDeleted) {
      throw new ApiError(httpStatus.FORBIDDEN, "User is deleted!");
    }

 

    // Check if the request was sent by authorized user or not
    if (requiredRoles && !requiredRoles.includes(role)) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Role mismatched. Unauthorized User!"
      );
    }

    req.user = decoded as JwtPayload;
    next();
  });
};

export default auth;

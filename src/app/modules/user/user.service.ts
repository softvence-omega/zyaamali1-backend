import config from "../../config";
import USER_ROLE from "../../constants/userRole";
import ApiError from "../../errors/ApiError";
import { TUser } from "./user.interface";
import { User } from "./user.model";
import bcrypt from "bcrypt";
import httpStatus from "http-status";

const getAllUsersFromDB = async () => {
  const result = await User.find({ isDeleted: false });
  return result;
};

const getSingleUserFromDB = async (id: string) => {
  const user = await User.findOne({
    _id: id,
    isDeleted: false,
  });
  if (!user) throw new ApiError(httpStatus.FORBIDDEN, "Failed to Fetch user");

  const result = await User.findById(id);
  return result;
};

const createAUserIntoDB = async (payload: TUser) => {
  const existingUser = await User.findOne({
    email: payload.email,
    role: USER_ROLE.USER,
  });
  if (existingUser) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "User with this email already exists"
    );
  }
  const newHashedPassword = await bcrypt.hash(
    payload?.password,
    Number(config.bcrypt_salt_rounds)
  );
  payload.password = newHashedPassword;

  const result = await User.create(payload);
  return {
    name: result.name,
    email: result.email,
    role: result.role,
  };
};

export const UserServices = {
  getSingleUserFromDB,
  getAllUsersFromDB,
  createAUserIntoDB,
};

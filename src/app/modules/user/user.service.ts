import { JwtPayload } from "jsonwebtoken";
import config from "../../config";
import USER_ROLE from "../../constants/userRole";
import ApiError from "../../errors/ApiError";
import { TUser } from "./user.interface";
import { User } from "./user.model";
import bcrypt from "bcrypt";
import httpStatus from "http-status";
import { sendFileToCloudinary } from "../../utils/sendFileToCloudinary";

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
  return user;
};

const getMeFromDB = async (user: JwtPayload) => {
  const existingUser = await User.findOne({
    _id: user.userId,
    isDeleted: false,
  });
  if (!existingUser)
    throw new ApiError(httpStatus.FORBIDDEN, "Failed to Fetch user");

  return existingUser;
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
    image: result.image,
    email: result.email,
    password: result.password,
    role: result.role,
    token: result.token,
    theme: result.theme,
    language: result.language,
  };
};

const uploadImageIntoDB = async (userData: any, file: any) => {
  const user = await User.findOne({
    _id: userData.userId,
    isDeleted: false,
  });
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  if (!file)
    throw new ApiError(httpStatus.BAD_REQUEST, "Please provide an image first");

  const imageName = `${user.name}-${user.role}-${Date.now()}`;
  const cloudinary_response = (await sendFileToCloudinary(
    imageName,
    file?.path,
    "image"
  )) as { secure_url: string };
  console.log(cloudinary_response);

  const result = await User.findOneAndUpdate(
    { _id: userData.userId },
    { image: cloudinary_response.secure_url },
    { new: true, runValidators: true }
  );
  return result;
};

const changeUserLanguage = async (user: any, language: string) => {
  const existingUser = await await User.findOne({
    _id: user.userId,
    isDeleted: false,
  });
  if (!existingUser)
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  return await User.findByIdAndUpdate(
    user.userId,
    { language },
    { new: true, runValidators: true }
  );
};

const changeUserTheme = async (user: any, theme: string) => {
  const existingUser = await User.findOne({
    _id: user.userId,
    isDeleted: false,
  });
  if (!existingUser)
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  return await User.findByIdAndUpdate(
    user.userId,
    { theme },
    { new: true, runValidators: true }
  );
};

const toggleUserDeleteInDB = async (id: string, deleted: boolean) => {
  const existingUser = await User.findById(id);
  if (!existingUser)
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  return await User.findByIdAndUpdate(
    id,
    { isDeleted: deleted },
    { new: true, runValidators: true }
  );
};

export const UserServices = {
  getSingleUserFromDB,
  getMeFromDB,
  getAllUsersFromDB,
  createAUserIntoDB,
  changeUserLanguage,
  changeUserTheme,
  uploadImageIntoDB,
  toggleUserDeleteInDB,
};

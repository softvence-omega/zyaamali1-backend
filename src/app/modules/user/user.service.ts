import { JwtPayload } from "jsonwebtoken";
import config from "../../config";
import USER_ROLE from "../../constants/userRole";
import ApiError from "../../errors/ApiError";
import { TUser } from "./user.interface";
import { User } from "./user.model";
import bcrypt from "bcrypt";
import httpStatus from "http-status";
import { sendFileToCloudinary } from "../../utils/sendFileToCloudinary";
import { sendVerificationEmail } from "../../utils/sendVerificationEmail";
import mongoose from "mongoose";
import QueryBuilder from "../../builder/QueryBuilder";


export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit verification code 
}

export const getAllUsersFromDB = async (query: Record<string, unknown>) => {
  const baseQuery = User.find({ isDeleted: false });

  const queryBuilder = new QueryBuilder<TUser>(baseQuery, query)
    .search(["fullName", "email", "companyName"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const users = await queryBuilder.modelQuery;
  const meta = await queryBuilder.countTotal();

  return {
    meta,
    data: users,
  };
};
const getSingleUserFromDB = async (id: string) => {
  const user = await User.findOne({
    _id: id,
    isDeleted: false,
  });
  if (!user) throw new ApiError(httpStatus.FORBIDDEN, "User not Found!");
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



export const createAUserIntoDB = async (payload: TUser) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingUser = await User.findOne({ email: payload.email }).session(session);
    if (existingUser) {
      throw new ApiError(httpStatus.CONFLICT, "User with this email already exists");
    }

    if (!payload.password && !payload.provider) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Password is required if provider is not set");
    }

    const hashedPassword = payload.password
      ? await bcrypt.hash(payload.password, Number(config.bcrypt_salt_rounds))
      : undefined;

    const verificationCode = generateVerificationCode();
    const verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const lastVerificationSentAt = new Date();

    const userData: Partial<TUser> = {
      ...payload,
      password: hashedPassword,
      verificationCode,
      verificationCodeExpiresAt,
      lastVerificationSentAt,
      isVerified: false,
      isActive: true,
      isDeleted: false,
    };

    const createdUsers = await User.create([userData], { session });
    const createdUser = createdUsers[0];

    // await sendVerificationEmail(createdUser.email, verificationCode);

    await session.commitTransaction();
    session.endSession();

    return {
      fullName: createdUser.fullName,
      email: createdUser.email,
      role: createdUser.role,
      image: createdUser.image,
      isVerified: createdUser.isVerified
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};




const uploadImageIntoDB = async (userData: any, file: any) => {
  const user = await User.findOne({
    _id: userData.userId,
    isDeleted: false,
  });
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  if (!file)
    throw new ApiError(httpStatus.BAD_REQUEST, "Please provide an image first");

  const imageName = `${user.image}-${user.role}-${Date.now()}`;
  const cloudinary_response = (await sendFileToCloudinary(
    imageName,
    file?.path,
    "image"
  )) as { secure_url: string };

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

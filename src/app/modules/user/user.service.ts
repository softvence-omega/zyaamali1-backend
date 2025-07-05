import { JwtPayload } from "jsonwebtoken";
import config from "../../config";
import ApiError from "../../errors/ApiError";
import { TUser } from "./user.interface";
import { User } from "./user.model";
import bcrypt from "bcrypt";
import httpStatus from "http-status";
import { sendFileToCloudinary } from "../../utils/sendFileToCloudinary";
import mongoose from "mongoose";
import QueryBuilder from "../../builder/QueryBuilder";
import { Viewer } from "../viewer/viewer.model";
import e from "express";
import { Creator } from "../creator/creator.model";


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


    const hashedPassword = await bcrypt.hash(payload.password as string, Number(config.bcrypt_salt_rounds));
    const verificationCode = generateVerificationCode();
    const verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const lastVerificationSentAt = new Date();

    if (!payload.password) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Password is required");
    }


    // const hashedPassword = payload.password
    //   ? await bcrypt.hash(payload.password, Number(config.bcrypt_salt_rounds))
    //   : undefined;


    const userData: Partial<TUser> = {
      ...payload,
      password: hashedPassword,
      isDeleted: false,
    };

    const createdUsers = await User.create([userData], { session });
    const createdUser = createdUsers[0];


    await session.commitTransaction();
    session.endSession();

    return createdUser;

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



const updateProfile = async (id: string, payload: Partial<TUser>) => {

  const isUserExist = await User.findOne({
    _id: id,
    isDeleted: false,
  });
  if (!isUserExist) throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  let result;
  if (isUserExist.role === "admin") {
    result = await User.findOneAndUpdate(
      { _id: id },
      { ...payload },
      { new: true, runValidators: true }
    );
  }

  if (isUserExist.role === "viewer") {
    result = await User.findOneAndUpdate(
      { _id: id },
      { fullName: payload.fullName },
      { new: true, runValidators: true }
    );
    await Viewer.updateOne(
      { userId: id },
      { fullName: payload.fullName },
      { runValidators: true }
    );
  } else if (isUserExist.role === "creator") {
    result = await User.findOneAndUpdate(
      { _id: id },
      { fullName: payload.fullName },
      { new: true, runValidators: true }
    );
    await Creator.updateOne(
      { userId: id },
      { fullName: payload.fullName },
      { runValidators: true }
    );
  }

  return result
}




export const UserServices = {
  getSingleUserFromDB,
  getMeFromDB,
  getAllUsersFromDB,
  createAUserIntoDB,
  uploadImageIntoDB,
  updateProfile
};

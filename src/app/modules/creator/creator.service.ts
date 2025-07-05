import { CREATOR_SEARCHABLE_FIELDS } from "./creator.constant";
import QueryBuilder from "../../builder/QueryBuilder";
import status from "http-status";
import ApiError from "../../errors/ApiError";
import mongoose from "mongoose";
import { User } from "../user/user.model";
import { Creator } from "./creator.model";
import { TCreator } from "./creator.interface";
import bcrypt from "bcrypt";
import config from "../../config";
import { sendTeamInviteEmail } from "../../utils/sendTeamInviteEmail";

export const creatorService = {
  async postCreatorIntoDB(data: any) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {

      const isCreastorExist = await Creator.findOne({ email: data.email, isDeleted: false }).session(session);
      if (isCreastorExist) {
        throw new ApiError(status.CONFLICT, "Creator already exists with this email");
      }
      const { createdBy, password, fullName, email, ...others } = data;
      const hashedPassword = await bcrypt.hash(password as string, Number(config.bcrypt_salt_rounds));

      const isUserExist = await User.findOne({ email, isDeleted: false }).session(session);
      if (isUserExist) {
        throw new ApiError(status.CONFLICT, "User already exists with this email");
      }




      const userData = {
        fullName,
        email,
        password: hashedPassword,
        role: "creator",
      };

      const userRegister = await User.create([userData], { session });

      const creatorData = {
        ...others,
        fullName,
        email,
        createdBy,
        userId: userRegister[0]._id,
        isDeleted: false,
        isActive: true,
      };

      const result = await Creator.create([creatorData], { session });
      sendTeamInviteEmail(data.email, `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f9f9f9; border-radius: 8px; color: #333;">
      <h2 style="color: #0052cc; text-align: center;">Team Invitation</h2>
      <p style="font-size: 16px;">Hi <strong>${data.fullName}</strong>,</p>
      <p style="font-size: 16px;">
        You have been invited to join our team as a <span style="color: #0070f3; font-weight: bold;">Creator</span>.
      </p>
      <p style="font-size: 16px;">
        Here are your login credentials:
      </p>
      <p style="font-size: 16px; background: #e1f0ff; padding: 12px; border-radius: 5px;">
        <strong>Email:</strong> ${data.email}<br>
        <strong>Password:</strong> ${data.password}
      </p>
      <p style="font-size: 16px;">
        Please keep this information safe and do not share it with others.
      </p>
      <p style="font-size: 16px;">
        Best regards,<br>
        The Team
      </p>
      <hr style="border:none; border-top: 1px solid #ddd; margin-top: 40px;">
      <p style="font-size: 12px; color: #777; text-align: center;">
        If you did not expect this email, you can safely ignore it.
      </p>
    </div>
  `  );
      await session.commitTransaction();
      await session.endSession();

      return result[0]; // Return the created viewer
    } catch (error: unknown) {
      await session.abortTransaction();
      await session.endSession();

      if (error instanceof Error) {
        throw new Error(`Creator creation failed: ${error.message}`);
      } else {
        throw new Error("An unknown error occurred while creating creator.");
      }
    }
  },
  async getAllCreatorFromDB(query: any, createdBy: string) {
    console.log(createdBy);
    try {


      const service_query = new QueryBuilder(Creator.find({ isDeleted: false, createdBy }).populate("userId").populate("createdBy"), query)
        .search(CREATOR_SEARCHABLE_FIELDS)
        .filter()
        .sort()
        .paginate()
        .fields();

      const result = await service_query.modelQuery;
      const meta = await service_query.countTotal();
      return {
        result,
        meta,
      };

    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`${error.message}`);
      } else {
        throw new Error("An unknown error occurred while fetching by ID.");
      }
    }
  },
  async getSingleCreatorFromDB(id: string, createdBy: string) {
    try {
      return await Creator.findById(id, createdBy).populate("userId").populate("createdBy", "fullName image");
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`${error.message}`);
      } else {
        throw new Error("An unknown error occurred while fetching by ID.");
      }
    }
  },
  async updateCreatorIntoDB(id: string, data: Partial<TCreator>, createdBy: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const isCreatorExist = await Creator.findOne({ _id: id, isDeleted: false, createdBy }).session(session);
      if (!isCreatorExist) {
        throw new ApiError(status.NOT_FOUND, "Creator not found");
      }

      const findUser = await User.findOne({ _id: isCreatorExist.userId, isDeleted: false }).session(session);
      if (!findUser) {
        throw new ApiError(status.NOT_FOUND, "User not found");
      }

      // Update User
      await User.updateOne(
        { _id: findUser._id },
        { fullName: data.fullName },
        { session }
      );

      // Update Viewer
      const result = await Creator.updateOne(
        { _id: isCreatorExist._id, isDeleted: false },
        { fullName: data.fullName },
        { session }
      );

      await session.commitTransaction();
      await session.endSession();

      return result;
    } catch (error: unknown) {
      await session.abortTransaction();
      await session.endSession();

      if (error instanceof Error) {
        throw new Error(`Creator update failed: ${error.message}`);
      } else {
        throw new Error("An unknown error occurred while updating Creator.");
      }
    }
  },
  async deleteCreatorFromDB(id: string, createdBy: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find the viewer within the session
      const isCreatorExist = await Creator.findOne({ _id: id, isDeleted: false, createdBy }).session(session);
      if (!isCreatorExist) {
        throw new ApiError(status.NOT_FOUND, "Creator not found");
      }

      // Find the linked user within the session
      const findUser = await User.findOne({ _id: isCreatorExist.userId, isDeleted: false }).session(session);
      if (!findUser) {
        throw new ApiError(status.NOT_FOUND, "User not found");
      }

      // Soft delete the user
      await User.updateOne(
        { _id: findUser._id },
        { isDeleted: true },
        { session }
      );

      // Soft delete the viewer
      const deleteViewer = await Creator.updateOne(
        { _id: isCreatorExist._id },
        { isDeleted: true },
        { session }
      );

      // Commit the transaction
      await session.commitTransaction();
      await session.endSession();

      return null;
    } catch (error: unknown) {
      // Rollback transaction
      await session.abortTransaction();
      await session.endSession();

      if (error instanceof Error) {
        throw new Error(`Creator deletion failed: ${error.message}`);
      } else {
        throw new Error("An unknown error occurred while deleting creator.");
      }
    }
  },
  async makeCreatorActive(id: string, createdBy: string) {
    const session = await mongoose.startSession();
    session.startTransaction();
    const isCreatorExist = await Creator.findOne({ _id: id, isDeleted: false, createdBy }).session(session);
    if (!isCreatorExist) {
      throw new ApiError(status.NOT_FOUND, "Creator not found");
    }

    const findUser = await User.findOne({ _id: isCreatorExist.userId, isDeleted: false }).session(session);
    if (!findUser) {
      throw new ApiError(status.NOT_FOUND, "User not found");
    }
    // console.log(findUser); 
    await User.updateOne(
      { _id: findUser._id },
      { isActive: true },
      { session }
    );
    await Creator.findByIdAndUpdate(id, { isActive: true }, { session, new: true });
    await session.commitTransaction();
    await session.endSession();
    return "";
  },

  async makeCreatorInactive(id: string, createdBy: string) {
    const session = await mongoose.startSession();
    session.startTransaction();
    const isCreatorExist = await Creator.findOne({ _id: id, isDeleted: false, createdBy }).session(session);
    if (!isCreatorExist) {
      throw new ApiError(status.NOT_FOUND, "Creator not found");
    }


    const findUser = await User.findOne({ _id: isCreatorExist.userId, isDeleted: false }).session(session);
    if (!findUser) {
      throw new ApiError(status.NOT_FOUND, "User not found");
    }
    // console.log(findUser);

    await Creator.findByIdAndUpdate(id, { isActive: false }, { session, new: true });

    await User.updateOne(
      { _id: findUser._id },
      { isActive: false },
      { session }
    );

    await session.commitTransaction();
    await session.endSession();
    return "";
  }

};
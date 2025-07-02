import { CREATOR_SEARCHABLE_FIELDS } from "./creator.constant";
import QueryBuilder from "../../builder/QueryBuilder";
import status from "http-status";
import ApiError from "../../errors/ApiError";
import mongoose from "mongoose";
import { User } from "../user/user.model";
import { Creator } from "./creator.model";
import { TCreator } from "./creator.interface";





export const creatorService = {
  async postCreatorIntoDB(data: any) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { createdBy, password, fullName, email, ...others } = data;

      const userData = {
        fullName,
        email,
        password,
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
  async getAllCreatorFromDB(query: any) {
    try {


      const service_query = new QueryBuilder(Creator.find({ isDeleted: false }).populate("userId").populate("createdBy", "fullName image"), query)
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
  async getSingleCreatorFromDB(id: string) {
    try {
      return await Creator.findById(id).populate("userId").populate("createdBy", "fullName image");
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`${error.message}`);
      } else {
        throw new Error("An unknown error occurred while fetching by ID.");
      }
    }
  },
  async updateCreatorIntoDB(id: string, data: Partial<TCreator>) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const isCreatorExist = await Creator.findOne({ _id: id, isDeleted: false }).session(session);
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
  async deleteCreatorFromDB(id: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find the viewer within the session
      const isCreatorExist = await Creator.findOne({ _id: id, isDeleted: false }).session(session);
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
  async makeCreatorActive(id: string) {
    const session = await mongoose.startSession();
    session.startTransaction();
    const isCreatorExist = await Creator.findOne({ _id: id, isDeleted: false }).session(session);
    if (!isCreatorExist) {
      throw new ApiError(status.NOT_FOUND, "Creator not found");
    }
    await Creator.findByIdAndUpdate(id, { isActive: true }, { session, new: true });
    await session.commitTransaction();
    await session.endSession();
    return "";
  },

  async makeCreatorInactive(id: string) {
    const session = await mongoose.startSession();
    session.startTransaction();
    const isCreatorExist = await Creator.findOne({ _id: id, isDeleted: false }).session(session);
    if (!isCreatorExist) {
      throw new ApiError(status.NOT_FOUND, "Creator not found");
    }

    await Creator.findByIdAndUpdate(id, { isActive: false }, { session, new: true });

    await session.commitTransaction();
    await session.endSession();
    return "";
  }

};
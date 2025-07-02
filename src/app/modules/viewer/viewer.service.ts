import { Viewer } from "./viewer.model";
import { VIEWER_SEARCHABLE_FIELDS } from "./viewer.constant";
import QueryBuilder from "../../builder/QueryBuilder";
import status from "http-status";
import ApiError from "../../errors/ApiError";
import { TViewer } from "./viewer.interface";
import { User } from "../user/user.model";
import mongoose from "mongoose";

export const viewerService = {
  async postViewerIntoDB(data: any) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { createdBy, password, fullName, email, ...others } = data;

      const userData = {
        fullName,
        email,
        password,
        role: "viewer",
      };

      const userRegister = await User.create([userData], { session });

      const viewerData = {
        ...others,
        fullName,
        email,
        createdBy,
        userId: userRegister[0]._id,
        isDeleted: false,
      };

      const result = await Viewer.create([viewerData], { session });

      await session.commitTransaction();
      await session.endSession();

      return result[0]; // Return the created viewer
    } catch (error: unknown) {
      await session.abortTransaction();
      await session.endSession();

      if (error instanceof Error) {
        throw new Error(`Viewer creation failed: ${error.message}`);
      } else {
        throw new Error("An unknown error occurred while creating viewer.");
      }
    }
  },
  async getAllViewerFromDB(query: any) {
    try {


      const service_query = new QueryBuilder(Viewer.find({ isDeleted: false }).populate("userId").populate("createdBy", "fullName image"), query)
        .search(VIEWER_SEARCHABLE_FIELDS)
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
  async getSingleViewerFromDB(id: string) {
    try {
      return await Viewer.findById(id).populate("userId").populate("createdBy", "fullName image");
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`${error.message}`);
      } else {
        throw new Error("An unknown error occurred while fetching by ID.");
      }
    }
  },
  async updateViewerIntoDB(id: string, data: TViewer) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const isViewerExist = await Viewer.findOne({ _id: id, isDeleted: false }).session(session);
      if (!isViewerExist) {
        throw new ApiError(status.NOT_FOUND, "Viewer not found");
      }

      const findUser = await User.findOne({ _id: isViewerExist.userId, isDeleted: false }).session(session);
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
      const result = await Viewer.updateOne(
        { _id: isViewerExist._id, isDeleted: false },
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
        throw new Error(`Viewer update failed: ${error.message}`);
      } else {
        throw new Error("An unknown error occurred while updating viewer.");
      }
    }
  },
  async deleteViewerFromDB(id: string) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the viewer within the session
    const isViewerExist = await Viewer.findOne({ _id: id, isDeleted: false }).session(session);
    if (!isViewerExist) {
      throw new ApiError(status.NOT_FOUND, "Viewer not found");
    }

    // Find the linked user within the session
    const findUser = await User.findOne({ _id: isViewerExist.userId, isDeleted: false }).session(session);
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
    const deleteViewer = await Viewer.updateOne(
      { _id: isViewerExist._id },
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
      throw new Error(`Viewer deletion failed: ${error.message}`);
    } else {
      throw new Error("An unknown error occurred while deleting viewer.");
    }
  }
}
};
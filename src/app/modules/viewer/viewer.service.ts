import { Viewer } from "./viewer.model";
import { VIEWER_SEARCHABLE_FIELDS } from "./viewer.constant";
import QueryBuilder from "../../builder/QueryBuilder";
import status from "http-status";
import ApiError from "../../errors/ApiError";
import { TViewer } from "./viewer.interface";
import { User } from "../user/user.model";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import config from "../../config";
import nodemailer from "nodemailer";
import { sendTeamInviteEmail } from "../../utils/sendTeamInviteEmail";
export const viewerService = {
  async postViewerIntoDB(data: any) {
    // console.log(data);
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const admin = await User.findById(data.createdBy).session(session);
      if (!admin || admin.role !== 'admin') {
        throw new ApiError(status.NOT_FOUND, 'Admin not found');
      }

      const isUserExist = await User.findOne({ email: data.email, isDeleted: false }).session(session);
      if (isUserExist) {
        throw new ApiError(status.CONFLICT, 'User already exists with this email');
      }

      const hashedPassword = await bcrypt.hash(
        data.password,
        Number(config.bcrypt_salt_rounds)
      );

      // const [newViewer] = await User.create(
      //   [
      //     {
      //       fullName: data.fullName,
      //       email: data.email,
      //       password: hashedPassword,
      //       role: 'viewer',
      //       companyName: admin.companyName,
      //       country: admin.country,
      //       createdBy: admin._id,
      //     },
      //   ],
      //   { session }
      // );

      const [newViewer] = await User.create(
        [
          {
            fullName: data.fullName,
            email: data.email,
            password: hashedPassword,
            role: 'viewer',
            companyName: admin.companyName,
            country: admin.country,
            createdBy: admin._id,
          },
        ],
        { session }
      );


      await User.updateOne(
        { _id: admin._id },
        { $addToSet: { teamMembers: newViewer._id } },
        { session }
      );

    

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
      session.endSession();

      const safeViewer = await User.findById(newViewer._id).select('-password');
      return safeViewer;






    } catch (error: unknown) {
      await session.abortTransaction();
      await session.endSession();

      if (error instanceof Error) {
        throw new Error(`Viwer creation failed: ${error.message}`);
      } else {
        throw new Error("An unknown error occurred while creating creator.");
      }
    }
  },
  async getAllViewerFromDB(query: any, createdBy: string) {
    try {


      const service_query = new QueryBuilder(User.find({ isDeleted: false, createdBy, role: "viewer" }), query)
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
  async getSingleViewerFromDB(id: string, createdBy: string) {
    // console.log({id, createdBy});
    try {
      const result = await User.findOne({ _id: id, createdBy, isDeleted: false, })

      // console.log(result);

      if (!result) {
        throw new ApiError(status.NOT_FOUND, "Viewer not found");
      }
      return result;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`${error.message}`);
      } else {
        throw new Error("An unknown error occurred while fetching by ID.");
      }
    }
  },
  async updateViewerIntoDB(id: string, data: Partial<TViewer>, createdBy: string) {
    console.log({ id, createdBy });

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const isViewerExist = await User.findOne({ _id: id, isDeleted: false, createdBy, role: "viewer" }).session(session);
      if (!isViewerExist) {
        throw new ApiError(status.NOT_FOUND, "Viewer not found");
      }


      // Update User
      const result = await User.updateOne(
        { _id: isViewerExist._id },
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

  async deleteViewerFromDB(id: string, createdBy: string) {
    console.log({ id, createdBy });
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const viwerUser = await User.findOne({
        _id: id,
        isDeleted: false,
        createdBy,
      }).session(session);

      if (!viwerUser) {
        throw new ApiError(status.NOT_FOUND, "Viewer not found");
      }

      await User.updateOne(
        { _id: viwerUser._id },
        { $set: { isDeleted: true } },
        { session }
      );



      await User.updateOne(
        { _id: createdBy },
        { $pull: { teamMembers: viwerUser._id } },
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      return null;                // বা success message ইত্যাদি
    } catch (err) {
      await session.abortTransaction();
      session.endSession();

      if (err instanceof Error) {
        throw new Error(`Creator deletion failed: ${err.message}`);
      }
      throw new Error("Unknown error while deleting creator.");
    }
  },

  async makeViewerActive(id: string, createdBy: string) {
    const session = await mongoose.startSession();
    session.startTransaction();
    const isViewerExist = await User.findOne({ _id: id, isDeleted: false, createdBy }).session(session);
    if (!isViewerExist) {
      throw new ApiError(status.NOT_FOUND, "Viewer not found");
    }



    // console.log(findUser); 
    await User.updateOne(
      { _id: isViewerExist._id },
      { isActive: true },
      { session }
    );
    // await Creator.findByIdAndUpdate(id, { isActive: true }, { session, new: true });
    await session.commitTransaction();
    await session.endSession();
    return "";
  },

  async makeViewerInactive(id: string, createdBy: string) {
    const session = await mongoose.startSession();
    session.startTransaction();
    const isViewerExist = await User.findOne({ _id: id, isDeleted: false, createdBy }).session(session);
    if (!isViewerExist) {
      throw new ApiError(status.NOT_FOUND, "Viewer not found");
    }

    await User.updateOne(
      { _id: isViewerExist._id },
      { isActive: false },
      { session }
    );

    await session.commitTransaction();
    await session.endSession();
    return "";
  }


};
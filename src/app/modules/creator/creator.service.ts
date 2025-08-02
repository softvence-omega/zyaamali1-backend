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
import { Viewer } from "../viewer/viewer.model";

export const creatorService = {
  async postCreatorIntoDB(data: {
    fullName: string;
    email: string;
    password: string;
    createdBy: string
  }) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      /* 1️⃣ যে অ্যাডমিন আবেদন করেছেন, তিনি সত্যিই আছেন তো? */
      const admin = await User.findById(data.createdBy).session(session);
      if (!admin || admin.role !== 'admin') {
        throw new ApiError(status.NOT_FOUND, 'Admin not found');
      }

      /* 2️⃣ ই‑মেইল ডুপ্লিকেট চেক */
      const isUserExist = await User.findOne({ email: data.email, isDeleted: false }).session(session);
      if (isUserExist) {
        throw new ApiError(status.CONFLICT, 'User already exists with this email');
      }

      /* 3️⃣ পাসওয়ার্ড হ্যাশ */
      const hashedPassword = await bcrypt.hash(
        data.password,
        Number(config.bcrypt_salt_rounds)
      );

      /* 4️⃣ নতুন Creator ইনসার্ট */
      const [newCreator] = await User.create(
        [
          {
            fullName: data.fullName,
            email: data.email,
            password: hashedPassword,
            role: 'creator',
            companyName: admin.companyName,
            country: admin.country,
            createdBy: admin._id,

          },
        ],
        { session }
      );

      /* 5️⃣ সেই Creator‑এর _id → admin.teamMembers[] তে পুশ */
      await User.updateOne(
        { _id: admin._id },
        { $addToSet: { teamMembers: newCreator._id } }, // $addToSet = ডুপ্লিকেট হলে আর ঢুকাবে না
        { session }
      );

    
      

      /* 6️⃣ ই‑মেইল পাঠানো (অপশনাল, ট্রান্স্যাকশন কমিটের আগে পাঠালেও OK) */
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

      /* 7️⃣ কমিট */
      await session.commitTransaction();
      session.endSession();

      /* 8️⃣ সেফ ভিউ (পাসওয়ার্ড ছাড়া) */
      const safeCreator = await User.findById(newCreator._id).select('-password');
      return safeCreator;






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
    try {


      const service_query = new QueryBuilder(User.find({ isDeleted: false, createdBy }), query)
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
      return await User.findOne({ _id: id, createdBy })
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
      const isCreatorExist = await User.findOne({ _id: id, isDeleted: false, createdBy, role: "creator" }).session(session);
      if (!isCreatorExist) {
        throw new ApiError(status.NOT_FOUND, "Creator not found");
      }


      // Update User
      const result = await User.updateOne(
        { _id: isCreatorExist._id },
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
      const creatorUser = await User.findOne({
        _id: id,
        isDeleted: false,
        createdBy,
        role: "creator",
      }).session(session);

      if (!creatorUser) {
        throw new ApiError(status.NOT_FOUND, "Creator not found");
      }

      await User.updateOne(
        { _id: creatorUser._id },
        { $set: { isDeleted: true } },
        { session }
      );



      await User.updateOne(
        { _id: createdBy },
        { $pull: { teamMembers: creatorUser._id } },
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

  async makeCreatorActive(id: string, createdBy: string) {
    const session = await mongoose.startSession();
    session.startTransaction();
    const isCreatorExist = await User.findOne({ _id: id, isDeleted: false, createdBy }).session(session);
    if (!isCreatorExist) {
      throw new ApiError(status.NOT_FOUND, "Creator not found");
    }



    // console.log(findUser); 
    await User.updateOne(
      { _id: isCreatorExist._id },
      { isActive: true },
      { session }
    );
    // await Creator.findByIdAndUpdate(id, { isActive: true }, { session, new: true });
    await session.commitTransaction();
    await session.endSession();
    return "";
  },

  async makeCreatorInactive(id: string, createdBy: string) {
    const session = await mongoose.startSession();
    session.startTransaction();
    const isCreatorExist = await User.findOne({ _id: id, isDeleted: false, createdBy }).session(session);
    if (!isCreatorExist) {
      throw new ApiError(status.NOT_FOUND, "Creator not found");
    }

    await User.updateOne(
      { _id: isCreatorExist._id },
      { isActive: false },
      { session }
    );

    await session.commitTransaction();
    await session.endSession();
    return "";
  }

};
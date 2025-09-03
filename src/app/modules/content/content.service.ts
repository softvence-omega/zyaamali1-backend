import { CONTENT_SEARCHABLE_FIELDS } from "./content.constant";
import QueryBuilder from "../../builder/QueryBuilder";
import status from "http-status";
import ApiError from "../../errors/ApiError";
import { ContentModel } from "./content.model";
import { sendFileToCloudinary } from "../../utils/sendFileToCloudinary";
import { v4 as uuid } from "uuid";
import { UploadApiResponse } from "cloudinary";

import fs from "fs";
import { IContent } from "./content.interface";
import { User } from "../user/user.model";
import { Creator } from "../creator/creator.model";
import { Viewer } from "../viewer/viewer.model";
import { TUser } from "../user/user.interface";
import mongoose from "mongoose";

type TContent = {
  title: string;
  platform: string;
  ratio: string
}


export const contentService = {
  async postPremadeContentIntoDB(
    data: any,
    file?: Express.Multer.File
  ) {
    if (!file) {
      throw new ApiError(status.BAD_REQUEST, "A file is required.");
    }

    // Automatically detect if the file is an image, video, or other
    const resourceType = file.mimetype.startsWith("video/")
      ? "video"
      : file.mimetype.startsWith("image/")
        ? "image"
        : "raw";

    const fileName = `content-${uuid()}`;

    let secure_url: string;

    try {
      // Upload the file to Cloudinary
      const cloudinaryResult = (await sendFileToCloudinary(
        fileName,
        file.path,
        resourceType
      )) as UploadApiResponse;

      secure_url = cloudinaryResult.secure_url;

      // console.log(secure_url);
      const contentType = file.mimetype.split("/")[0];


      const contentData = {
        ...data,
        type: contentType,
        source: "premade",
        link: secure_url,
      };


      // Check if content with same title & platform already exists
      const exists = await ContentModel.exists({
        title: contentData.title,
        platform: contentData.platform,
        type: contentData.type,
      });

      if (exists) {
        throw new ApiError(
          status.BAD_REQUEST,
          `A content of type '${contentData.type}' with the title '${contentData.title}' already exists on the '${contentData.platform}' platform.`
        );
      }



      // Save to DB
      return await ContentModel.create(contentData);
    } catch (err) {
      if (err instanceof ApiError) throw err;

      console.error(err);
      throw new ApiError(
        status.INTERNAL_SERVER_ERROR,
        "Something went wrong while saving the content."
      );
    } finally {
      // Clean up the temporary uploaded file
      fs.unlink(file.path, () => { });
    }
  },

  async postGenaratedContentIntoDB(data: IContent) {
    
    // console.log(data);

    const isContentExists = await ContentModel.exists({
      title: data.title,
      platform: data.platform,
      type: data.type,
      owner: data.owner,
    });

    if (isContentExists) {
      throw new ApiError(
        status.BAD_REQUEST,
        `A content of type '${data.type}' with the title '${data.title}' already exists on the '${data.platform}' platform.`
      );
    }

    const result = await ContentModel.create(data);
    return result

  },



  //   // Step 1: Check if user exists
  //   const findUser = await User.findById(userId);
  //   if (!findUser) {
  //     throw new ApiError(status.NOT_FOUND, "User not found");
  //   }

  //   // Step 2: If user is superAdmin → see all content
  //   if (findUser.role === "superAdmin") {
  //     const serviceQuery = new QueryBuilder(
  //       ContentModel.find({ isDeleted: false }),
  //       query
  //     )
  //       .search(CONTENT_SEARCHABLE_FIELDS)
  //       .filter()
  //       .sort()
  //       .paginate()
  //       .fields();

  //     const result = await serviceQuery.modelQuery;
  //     const meta = await serviceQuery.countTotal();

  //     return { result, meta };
  //   }

  //   // Step 3: Find the team admin (_id)
  //   let createdById: string | null = null;

  //   if (findUser.role === "admin") {
  //     // If current user is admin → team admin is himself
  //     createdById = findUser._id.toString();
  //   } else if (findUser.role === "creator") {
  //     const creator = await User.findOne({ createdBy: findUser._id });
  //     createdById = creator?.createdBy?.toString() || null;
  //   } else if (findUser.role === "viewer") {
  //     const viewer = await User.findOne({ createdBy: findUser._id });
  //     createdById = viewer?.createdBy?.toString() || null;
  //   }

  //   if (!createdById) {
  //     throw new ApiError(status.FORBIDDEN, "Team admin not found for this user");
  //   }

  //   // Step 4: Find all content (with owner info)
  //   const serviceQuery = new QueryBuilder(
  //     ContentModel.find({ isDeleted: false }).populate("owner"),
  //     query
  //   )
  //     .search(CONTENT_SEARCHABLE_FIELDS)
  //     .filter()
  //     .sort()
  //     .paginate()
  //     .fields();

  //   const allContent = await serviceQuery.modelQuery;

  //   // Step 5: Manual filtering
  //   const filteredResult = allContent.filter((content: any) => {
  //     const owner = content.owner;
  //     if (!owner) return false;

  //     // premade → always visible
  //     if (content.source === "premade") return true;

  //     // user-generated → allow if:
  //     return (
  //       owner._id?.toString() === findUser._id.toString() || // নিজের content
  //       owner._id?.toString() === createdById ||             // admin নিজে content তৈরি করেছে
  //       owner.createdBy?.toString() === createdById          // টিম মেম্বার content তৈরি করেছে
  //     );
  //   });

  //   const meta = {
  //     total: filteredResult.length,
  //   };

  //   return {
  //     result: filteredResult,
  //     meta,
  //   };
  // },
  async getAllContentFromDB(query: any, userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(status.NOT_FOUND, "User not found");

    if (user.role === "superAdmin") {
      const qb = new QueryBuilder(
        ContentModel.find({ isDeleted: false }),
        query,
      )
        .search(CONTENT_SEARCHABLE_FIELDS)
        .filter()
        .sort()
        .paginate()
        .fields();

      return { result: await qb.modelQuery, meta: await qb.countTotal() };
    }


    const teamAdminId =
      user.role === "admin"
        ? user._id
        : user.createdBy || null; 

    if (!teamAdminId) {
      throw new ApiError(status.FORBIDDEN, "Team admin not found for this user");
    }

    const qb = new QueryBuilder(
      ContentModel.find({ isDeleted: false }).populate("owner"),
      query,
    )
      .search(CONTENT_SEARCHABLE_FIELDS)
      .filter()
      .sort()
      .paginate()
      .fields();

    const contents = await qb.modelQuery;

    /* ---------- 5. ফিল্টার (সরল লজিক) ---------- */
    const result = contents.filter((c: any) => {
      const owner = c.owner;

      if (!owner) return false;             // owner ফাঁকা → বাদ দাও
      if (c.source === "premade") return true; // premade → সবার জন্য

      // নিচের তিন শর্তে ‘টিমের’ কনটেন্ট ধরা পড়বে
      return (
        owner._id.equals(user._id) ||         // যে লগ‑ইন আছে তার নিজের
        owner._id.equals(teamAdminId) ||      // টিম‑অ্যাডমিনের
        owner.createdBy?.equals(teamAdminId)  // টিম‑মেম্বারের
      );
    });

    return {
      result,
      meta: { total: result.length },
    };
  },



  async getSingleContentFromDB(id: string, userId: string) {
    const findUser = await User.findById(userId);
    if (!findUser) {
      throw new ApiError(status.NOT_FOUND, 'User not found');
    }

    const baseFilter = { _id: id, isDeleted: false };

    if (findUser.role === 'superAdmin') {
      return await ContentModel.findOne(baseFilter).populate('owner');
    }

    if (findUser.role === 'admin') {
      const filterCondition = {
        $or: [
          { source: 'premade' },
          { source: 'user', owner: findUser._id }, 
        ],
      };
      return await ContentModel.findOne({ ...baseFilter, ...filterCondition }).populate('owner');
    }

    if (findUser.role === 'creator' || findUser.role === 'viewer') {
      if (!findUser.createdBy) {
        throw new ApiError(status.FORBIDDEN, 'CreatedBy (admin) not found for this user');
      }

      const filterCondition = {
        $or: [
          { source: 'premade' },
          { source: 'user', owner: findUser.createdBy }, // নিজের admin এর content
        ],
      };

      return await ContentModel.findOne({ ...baseFilter, ...filterCondition }).populate('owner');
    }

    throw new ApiError(status.FORBIDDEN, 'You do not have permission to access this content.');
  }

  ,

  async updateContentIntoDB(id: string, data: Partial<TContent>, userId: string) {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // 1. Check if user exists

      const isContentExist = await ContentModel.findOne({ _id: id, isDeleted: false, owner: userId });
      // console.log(isContentExist);

      if (!isContentExist) {
        throw new ApiError(status.NOT_FOUND, 'Content not found!')
      }


      // 4. Update content with validation and session
      const updatedContent = await ContentModel.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
        session,
      });

      // 5. Commit transaction
      await session.commitTransaction();
      return updatedContent;
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
  ,

  async softDeleteContentFromDB(id: string, userId: string) {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // 1. Check if user exists

      const isContentExist = await ContentModel.findOne({ _id: id, isDeleted: false, owner: userId });
      // console.log(isContentExist);

      if (!isContentExist) {
        throw new ApiError(status.NOT_FOUND, 'Content not found!')
      }


      // 4. Update content with validation and session
    await ContentModel.findByIdAndUpdate(id, { isDeleted: true }, {
        new: true,
        runValidators: true,
        session,
      });

      // 5. Commit transaction
      await session.commitTransaction();
      return null;
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },



  async getAllPremadeContentFromDB(query: any) {
    try {


      const service_query = new QueryBuilder(ContentModel.find({ source: "premade" }), query)
        .search(CONTENT_SEARCHABLE_FIELDS)
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
  async getSinglePremadeContentFromDB(id: string) {
    try {
      return await ContentModel.findById(id);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`${error.message}`);
      } else {
        throw new Error("An unknown error occurred while fetching by ID.");
      }
    }
  },
};
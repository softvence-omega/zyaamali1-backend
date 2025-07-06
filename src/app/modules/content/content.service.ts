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

  async getAllContentFromDB(query: any, userId: string) {
    const findUser = await User.findById(userId);
    console.log(findUser, "findUser");
    if (!findUser) {
      throw new ApiError(status.NOT_FOUND, "User not found");
    }

    let filterCondition: any = {};

    if (findUser.role === "superAdmin") {
      // সব content দেখতে পারবে
      const service_query = new QueryBuilder(ContentModel.find(), query)
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

    }

    if (findUser.role === "admin") {
      // premade → সবই দেখতে পারবে
      // user → owner নিজের হলে দেখতে পারবে
      filterCondition = {
        $or: [
          { source: "premade" },
          { source: "user", owner: findUser._id }
        ]
      };

      const service_query = new QueryBuilder(ContentModel.find(filterCondition), query)
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

    }

    if (findUser.role === "creator") {
      const findCreator = await Creator.findOne({ userId: findUser._id });
      filterCondition = {
        $or: [
          { source: "premade" },
          { source: "user", owner: findCreator?.createdBy }
        ]
      };

      const service_query = new QueryBuilder(ContentModel.find(filterCondition), query)
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



    }
    if (findUser.role === "viewer") {
      const findViewer = await Viewer.findOne({ userId: findUser._id });
      filterCondition = {
        $or: [
          { source: "premade" },
          { source: "user", owner: findViewer?.createdBy }
        ]
      };

      const service_query = new QueryBuilder(ContentModel.find(filterCondition), query)
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



    }


  }
  ,

  async getSingleContentFromDB(id: string, userId: string) {
    const findUser = await User.findById(userId);
    if (!findUser) {
      throw new ApiError(status.NOT_FOUND, "User not found");
    }
    let filterCondition: any = {};
    if (findUser.role === "superAdmin") {
      // সব content দেখতে পারবে
      return await ContentModel.findById(id);
    }
    if (findUser.role === "admin") {
      // premade → সবই দেখতে পারবে
      // user → owner নিজের হলে দেখতে পারবে
      filterCondition = {
        $or: [
          { source: "premade" },
          { source: "user", owner: findUser._id }
        ]
      };
      return await ContentModel.findOne({ _id: id, ...filterCondition });
    }
    if (findUser.role === "creator") {
      const findCreator = await Creator.findOne({ userId: findUser._id });
      filterCondition = {
        $or: [
          { source: "premade" },
          { source: "user", owner: findCreator?.createdBy }
        ]
      };
      return await ContentModel.findOne({ _id: id, ...filterCondition });
    }
    if (findUser.role === "viewer") {
      const findViewer = await Viewer.findOne({ userId: findUser._id });
      filterCondition = {
        $or: [
          { source: "premade" },
          { source: "user", owner: findViewer?.createdBy }
        ]
      };
      return await ContentModel.findOne({ _id: id, ...filterCondition });
    }
    throw new ApiError(status.FORBIDDEN, "You do not have permission to access this content.");
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
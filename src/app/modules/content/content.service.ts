import { CONTENT_SEARCHABLE_FIELDS } from "./content.constant";
import QueryBuilder from "../../builder/QueryBuilder";
import status from "http-status";
import ApiError from "../../errors/ApiError";
import { ContentModel } from "./content.model";
import { sendFileToCloudinary } from "../../utils/sendFileToCloudinary";
import { v4 as uuid } from "uuid";
import { UploadApiResponse } from "cloudinary";

import fs from "fs";




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

    const contentData = {
      ...data,
      source: "premade",
      link: secure_url,
    };

    // Check if content with same title & platform already exists
    const exists = await ContentModel.exists({
      title: contentData.title,
      platform: contentData.platform,
    });

    if (exists) {
      throw new ApiError(
        status.BAD_REQUEST,
        "Content with this title and platform already exists."
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
    fs.unlink(file.path, () => {});
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
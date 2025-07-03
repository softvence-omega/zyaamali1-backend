import { CONTENT_SEARCHABLE_FIELDS } from "./content.constant";
import QueryBuilder from "../../builder/QueryBuilder";
import status from "http-status";
import ApiError from "../../errors/ApiError";
import { ContentModel } from "./content.model";
import { sendFileToCloudinary } from "../../utils/sendFileToCloudinary";





export const contentService = {
  async postPremadeContentIntoDB(data: any, file: any) {
    try {
      const imageName = `$content-${Date.now()}`;
      const cloudinary_response = (await sendFileToCloudinary(
        imageName,
        file?.path,
        "image"
      )) as { secure_url: string };

      // console.log(cloudinary_response, "cloudinary_response");

      const contentData = {
        ...data,
        source: "premade",
        link: cloudinary_response.secure_url,
      };

      // console.log(contentData, "contentData");

      const isContextAlreadyExists = await ContentModel.findOne({
        title: contentData.title,
        platform: contentData.platform,
      });
      if (isContextAlreadyExists) {
        throw new ApiError(
          status.BAD_REQUEST,
          "Content with this title and platform already exists."
        );
      }
      const result = await ContentModel.create(contentData);
      return result;

    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`${error.message}`);
      } else {
        throw new Error("An unknown error occurred while fetching by ID.");
      }
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
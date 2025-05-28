import { configureModel } from "./configure.model";
import { CONFIGURE_SEARCHABLE_FIELDS } from "./configure.constant";
import QueryBuilder from "../../builder/QueryBuilder";
import status from "http-status";
import ApiError from "../../errors/ApiError";


export const configureService = {
  
  async postConfigureIntoDB(data: any) {
    try {
     const count = await configureModel.countDocuments();
     if(count > 0) {
      throw new ApiError(status.BAD_REQUEST, "Configure already exists, you can only update it.")
     }else{
       return await configureModel.create(data);
     }
    } catch (error: unknown) {
      throw error;
    }
  },
  async getAllConfigureFromDB(query: any) {
    try {
      const service_query = new QueryBuilder(configureModel.find(), query)
        .search(CONFIGURE_SEARCHABLE_FIELDS)
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
      throw error;

    }
  },
  async getSingleConfigureFromDB(id: string) {
    try {
      return await configureModel.findById(id);
    } catch (error: unknown) {
      throw error;

    }
  },
  async updateConfigureIntoDB(data: any) {
    try {


      const isExisting = await configureModel.findOne({ _id: data.id });
      if (!isExisting) {
        throw new ApiError(status.NOT_FOUND, "configure not found");
      }

      const result = await configureModel.updateOne({ _id: data.id }, data, {
        new: true,
      });
      if (!result) {
        throw new Error("configure not found.");
      }
      return result;


    } catch (error: unknown) {
      throw error;

    }
  },

};
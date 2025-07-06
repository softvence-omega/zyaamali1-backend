import { reportsModel } from "./reports.model";
import { REPORTS_SEARCHABLE_FIELDS } from "./reports.constant";
import QueryBuilder from "../../builder/QueryBuilder";
import status from "http-status";
import ApiError from "../../errors/ApiError";
import { User } from "../user/user.model";





export const reportsService = {
  async postReportsIntoDB(data: any) {
    try {
      return await reportsModel.create(data);
    } catch (error: unknown) {
      throw error;
    }
  },
  async getAllReportsFromDB(query: any) {
    try {


      const service_query = new QueryBuilder(reportsModel.find(), query)
        .search(REPORTS_SEARCHABLE_FIELDS)
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
  async getSingleReportsFromDB(id: string) {
    try {
      return await reportsModel.findById(id);
    } catch (error: unknown) {
      throw error;
    }
  },
  async getAllCampaignReportsFromDB(loggedInUserId: string) {
    try {
      const findLoggedInUser = await User.findById(loggedInUserId);
    } catch (error: unknown) {
      throw error;
    }
  },
  async updateReportsIntoDB(data: any) {
    try {



      const isDeleted = await reportsModel.findOne({ _id: data.id });
      if (isDeleted?.isDelete) {
        throw new ApiError(status.NOT_FOUND, "reports is already deleted");
      }

      const result = await reportsModel.updateOne({ _id: data.id }, data, {
        new: true,
      });
      if (!result) {
        throw new Error("reports not found.");
      }
      return result;


    } catch (error: unknown) {
      throw error;
    }
  },
  async deleteReportsFromDB(id: string) {
    try {


      // Step 1: Check if the reports exists in the database
      const isExist = await reportsModel.findOne({ _id: id });

      if (!isExist) {
        throw new ApiError(status.NOT_FOUND, "reports not found");
      }

      // Step 4: Delete the home reports from the database
      await reportsModel.updateOne({ _id: id }, { isDelete: true });
      return;

    } catch (error: unknown) {
      throw error;
    }
  },
};
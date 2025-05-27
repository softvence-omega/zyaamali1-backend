import { PricingModel } from "./Pricing.model";
import { PRICING_SEARCHABLE_FIELDS } from "./Pricing.constant";
import QueryBuilder from "../../builder/QueryBuilder";
import status from "http-status";
import ApiError from "../../errors/ApiError";

export const PricingService = {
  async postPricingIntoDB(data: any) {
    try {
      return await PricingModel.create(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`${error.message}`);
      } else {
        throw new Error("An unknown error occurred while fetching by ID.");
      }
    }
  },
  async getAllPricingFromDB(query: any) {
    try {
      const service_query = new QueryBuilder(PricingModel.find(), query)
        .search(PRICING_SEARCHABLE_FIELDS)
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
  async getSinglePricingFromDB(id: string) {
    try {
      return await PricingModel.findOne({ _id: id, isDelete: false });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`${error.message}`);
      } else {
        throw new Error("An unknown error occurred while fetching by ID.");
      }
    }
  },
  async updatePricingIntoDB(data: any) {
    try {
      const isDeleted = await PricingModel.findOne({ _id: data.id });
      if (isDeleted?.isDelete) {
        throw new ApiError(status.NOT_FOUND, "Pricing is already deleted");
      }

      const result = await PricingModel.updateOne({ _id: data.id }, data, {
        new: true,
      });
      if (!result) {
        throw new Error("Pricing not found.");
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
  async deletePricingFromDB(id: string) {
    try {
      // Step 1: Check if the Pricing exists in the database
      const isExist = await PricingModel.findOne({ _id: id });

      if (!isExist) {
        throw new ApiError(status.NOT_FOUND, "Pricing not found");
      }

      // Step 4: Delete the home Pricing from the database
      await PricingModel.updateOne({ _id: id }, { isDelete: true });
      return;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`${error.message}`);
      } else {
        throw new Error("An unknown error occurred while fetching by ID.");
      }
    }
  },
};

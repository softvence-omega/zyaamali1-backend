import { PricingModel } from "./Pricing.model";
import { PRICING_SEARCHABLE_FIELDS } from "./Pricing.constant";
import QueryBuilder from "../../builder/QueryBuilder";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";

export const PricingService = {
  async postPricingIntoDB(data: any) {
    try {
      // Check if a pricing plan with the same name already exists
      const existingPricing = await PricingModel.findOne({ name: data.name, isDeleted: false });
      if (existingPricing) {
        throw new ApiError(httpStatus.CONFLICT, "A pricing plan with this name already exists.");
      }
      return await PricingModel.create(data);
    } catch (error: unknown) {
      throw error;
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
      return { result, meta };
    } catch (error: unknown) {
      throw error;
    }
  },

  async getSinglePricingFromDB(id: string) {
    try {
      const pricing = await PricingModel.findOne({ _id: id, isDeleted: false });

      if (!pricing) {
        throw new ApiError(httpStatus.NOT_FOUND, "Pricing not found or has been deleted.");
      }

      return pricing;
    } catch (error: unknown) {
      throw error;

    }
  },

  async updatePricingIntoDB(data: any) {
    try {
      const existingPricing = await PricingModel.findOne({ _id: data.id });

      if (!existingPricing) {
        throw new ApiError(httpStatus.NOT_FOUND, "Pricing not found.");
      }

      if (existingPricing.isDeleted) {
        throw new ApiError(httpStatus.GONE, "Cannot update: pricing has been deleted.");
      }

      const result = await PricingModel.findByIdAndUpdate(data.id, data, { new: true });

      return result;
    } catch (error: unknown) {
      throw error;

    }
  },

  async deletePricingFromDB(id: string) {
    try {
      const pricing = await PricingModel.findOne({ _id: id });

      if (!pricing) {
        throw new ApiError(httpStatus.NOT_FOUND, "Pricing not found.");
      }

      if (pricing.isDeleted) {
        throw new ApiError(httpStatus.GONE, "Pricing is already deleted.");
      }

      await PricingModel.updateOne({ _id: id }, { isDeleted: true });

      return;
    } catch (error: unknown) {
      throw error;

    }
  },
};

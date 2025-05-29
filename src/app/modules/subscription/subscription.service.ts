import { subscriptionModel } from "./subscription.model";
import { SUBSCRIPTION_SEARCHABLE_FIELDS } from "./subscription.constant";
import QueryBuilder from "../../builder/QueryBuilder";






export const subscriptionService = {
  async postSubscriptionIntoDB(data: any) {
    try {
      return await subscriptionModel.create(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`${error.message}`);
      } else {
        throw new Error("An unknown error occurred while fetching by ID.");
      }
    }
  },
  async getAllSubscriptionFromDB(query: any) {
    try {


      const service_query = new QueryBuilder(subscriptionModel.find(), query)
        .search(SUBSCRIPTION_SEARCHABLE_FIELDS)
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
  async getSingleSubscriptionFromDB(id: string) {
    try {
      return await subscriptionModel.findById(id);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`${error.message}`);
      } else {
        throw new Error("An unknown error occurred while fetching by ID.");
      }
    }
  },
  async updateSubscriptionIntoDB(data: any) {
    try {



      const isDeleted = await subscriptionModel.findOne({ _id: data.id });


      const result = await subscriptionModel.updateOne({ _id: data.id }, data, {
        new: true,
      });
      if (!result) {
        throw new Error("subscription not found.");
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
  async deleteSubscriptionFromDB(id: string) {
    try {


      // Step 1: Check if the subscription exists in the database
      const isExist = await subscriptionModel.findOne({ _id: id });



      // Step 4: Delete the home subscription from the database
      await subscriptionModel.updateOne({ _id: id }, { isDelete: true });
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
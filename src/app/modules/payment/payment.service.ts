import { paymentModel } from "./payment.model";
import { PAYMENT_SEARCHABLE_FIELDS } from "./payment.constant";
import QueryBuilder from "../../builder/QueryBuilder";
import status from "http-status";
import ApiError from "../../errors/ApiError";
import Stripe from 'stripe';
import config from "../../config";

if (!config.stripe_secret_key) {
  throw new Error("Stripe secret key is not defined in the configuration.");
}

const stripe = new Stripe(config.stripe_secret_key, {
  apiVersion: '2025-04-30.basil',
});


export const paymentService = {
  async createCheckoutSessionIntoDB(data: any) {
    try {
      const { amount=300, currency = 'USD' } = data;
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        automatic_payment_methods: { enabled: true },
      });
  
  
       await paymentModel.create(data);
      return {
        clientSecret: paymentIntent.client_secret,
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`${error.message}`);
      } else {
        throw new Error("An unknown error occurred while fetching by ID.");
      }
    }
  },
  async postPaymentIntoDB(data: any) {
    try {
      return await paymentModel.create(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`${error.message}`);
      } else {
        throw new Error("An unknown error occurred while fetching by ID.");
      }
    }
  },
  async getAllPaymentFromDB(query: any) {
    try {
      const service_query = new QueryBuilder(paymentModel.find(), query)
        .search(PAYMENT_SEARCHABLE_FIELDS)
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
  async getSinglePaymentFromDB(id: string) {
    try {
      return await paymentModel.findById(id);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`${error.message}`);
      } else {
        throw new Error("An unknown error occurred while fetching by ID.");
      }
    }
  },
  async updatePaymentIntoDB(data: any) {
    try {
      const isDeleted = await paymentModel.findOne({ _id: data.id });
      if (isDeleted?.isDelete) {
        throw new ApiError(status.NOT_FOUND, "payment is already deleted");
      }

      const result = await paymentModel.updateOne({ _id: data.id }, data, {
        new: true,
      });
      if (!result) {
        throw new Error("payment not found.");
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
  async deletePaymentFromDB(id: string) {
    try {
      // Step 1: Check if the payment exists in the database
      const isExist = await paymentModel.findOne({ _id: id });

      if (!isExist) {
        throw new ApiError(status.NOT_FOUND, "payment not found");
      }

      // Step 4: Delete the home payment from the database
      await paymentModel.updateOne({ _id: id }, { isDelete: true });
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

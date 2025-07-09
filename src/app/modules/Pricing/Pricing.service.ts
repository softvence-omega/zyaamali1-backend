import { PricingModel } from "./Pricing.model";
import { PRICING_SEARCHABLE_FIELDS } from "./Pricing.constant";
import QueryBuilder from "../../builder/QueryBuilder";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { stripe } from "../../utils/stripe";

export const PricingService = {
  
  async postPricingIntoDB(data: any) {
    try {
      // Check for duplicate plan
      const existingPricing = await PricingModel.findOne({
        name: data.name,
        isDeleted: false,
      });

      if (existingPricing) {
        throw new ApiError(
          httpStatus.CONFLICT,
          "A pricing plan with this name already exists."
        );
      }

      // Create Stripe Product
      const product = await stripe.products.create({
        name: data.name,
        description: `Use case: ${data.usedCase}`,
      });

      // Create Stripe Price (recurring)
      const price = await stripe.prices.create({
        unit_amount: data.price * 100, // cents
        currency: "usd",
        recurring: { interval: data.billingInterval || "month" },// "month" or "year"
        product: product.id,
      });

      // Save to MongoDB
      const newPricing = await PricingModel.create({
        ...data,
        stripePriceId: price.id,
      });

      return newPricing;
    } catch (error: unknown) {
      console.error("Error creating pricing plan:", error);
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

    // Update Stripe Product name/description if changed
    if (existingPricing.stripePriceId) {
      const price = await stripe.prices.retrieve(existingPricing.stripePriceId);
      const productId = typeof price === "object" && 'product' in price ? price.product as string : undefined;

      if (productId) {
        await stripe.products.update(productId, {
          name: data.name,
          description: `Use case: ${data.usedCase}`,
        });
      }

      // Stripe prices are immutable — if amount or billingInterval changes, create a new price
      if (data.price && data.price !== existingPricing.price || data.billingInterval && data.billingInterval !== existingPricing.billingInterval) {
        const newPrice = await stripe.prices.create({
          unit_amount: data.price * 100,
          currency: "usd",
          recurring: {
            interval: data.billingInterval || "month"
          },
          product: productId
        });

        data.stripePriceId = newPrice.id; // update stripePriceId in DB
      }
    }

    // Update MongoDB
    const result = await PricingModel.findByIdAndUpdate(data.id, data, { new: true });

    return result;
  } catch (error: unknown) {
    console.error("Failed to update pricing:", error);
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

import { cartModel } from "./cart.model";
import { CART_SEARCHABLE_FIELDS } from "./cart.constant";
import status from "http-status";
import ApiError from "../../errors/ApiError";
import QueryBuilder from "../../builder/QueryBuilder";

export const cartService = {
  async postCartIntoDB(data: any) {
    try {
      return await cartModel.create(data);
    } catch (error: unknown) {
      throw error;
    }
  },

  async getAllCartFromDB(query: any, userId: string) {
    try {
      const service_query = new QueryBuilder(cartModel.find({ userId }), query)
        .search(CART_SEARCHABLE_FIELDS)
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
  async getSingleCartFromDB(id: string, userId: string) {
    try {
      return await cartModel.findOne({
        _id: id,
        userId,
        isDeleted: false
      });
    } catch (error: unknown) {
      throw error;
    }
  },
  async updateCartIntoDB(data: any, id: string, userId: string) {
    try {
      const isDeleted = await cartModel.findOne({ _id: id, userId });
      if (isDeleted?.isDeleted) {
        throw new ApiError(status.NOT_FOUND, "cart is already deleted");
      }

      const result = await cartModel.updateOne({ _id: id, userId }, data, {
        new: true,
      });
      if (!result) {
        throw new Error("cart not found.");
      }
      return result;
    } catch (error: unknown) {
      throw error;
    }
  },
  async deleteCartFromDB(id: string, userId: string) {
    try {
      // Step 1: Check if the cart exists in the database
      const isExist = await cartModel.findOne({ _id: id, userId });

      if (!isExist) {
        throw new ApiError(status.NOT_FOUND, "cart not found");
      }
      if (isExist.isDeleted) {
        throw new ApiError(status.NOT_FOUND, "Cart is already deleted");
      }

      // Step 4: Delete the home cart from the database
      await cartModel.updateOne({ _id: id, userId }, { isDeleted: true });
      return;
    } catch (error: unknown) {
      throw error;
    }
  },
};

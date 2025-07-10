import { subscriptionModel } from "../modules/subscription/subscription.model";
import mongoose from "mongoose";

/**
 * Get the most recent subscription for a given user.
 */
export const getLatestSubscriptionByUser = async (userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) return null;

  return subscriptionModel
    .findOne({ userId })
    .sort({ paymentDate: -1 }); // latest first
};

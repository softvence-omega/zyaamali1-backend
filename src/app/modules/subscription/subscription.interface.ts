import mongoose from "mongoose";

export interface ISubscription  {
    userId: mongoose.Types.ObjectId;
    pricingPlanId: mongoose.Types.ObjectId;
    stripeSubscriptionId: string;
    stripeCustomerId: string;
    currentPeriodEnd: Date;
    status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing';
  }
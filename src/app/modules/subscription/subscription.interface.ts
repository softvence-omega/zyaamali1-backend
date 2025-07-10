import mongoose from "mongoose";

export interface ISubscription {
  userId: mongoose.Types.ObjectId;
  pricingPlanId: mongoose.Types.ObjectId;
  stripePaymentIntentId?: string; // For one-time payments
  stripeCustomerId: string; // Stripe customer ID 
  stripeSubscriptionId: string;
  amountPaid: number; // Amount paid in cents
  currency?: string; // Default to "usd"
  autoRenew?: boolean; // Whether the subscription auto-renews
  paymentDate?: Date; // Date of the last payment
  status: 'active' | 'canceled' | 'expired'; // Subscription status
}
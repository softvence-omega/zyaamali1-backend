
import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  pricingPlanId: { type: Schema.Types.ObjectId, ref: "Pricing", required: true },
  stripePaymentIntentId: { type: String },
  stripeCustomerId: { type: String, required: true },
  stripeSubscriptionId: { type: String }, // 🔁 for recurring subscriptions
  status: { type: String, required: true }, // active, canceled, etc.
  amountPaid: { type: Number }, // in cents
  currency: { type: String, default: "usd" },
  autoRenew: { type: Boolean, default: false },
  paymentDate: { type: Date, default: Date.now },
});

export const subscriptionModel = mongoose.model("Subscription", subscriptionSchema);

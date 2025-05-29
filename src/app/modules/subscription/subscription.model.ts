import mongoose, { Schema } from "mongoose";
    
    const subscriptionSchema = new mongoose.Schema(
        {
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    pricingPlanId: { type: Schema.Types.ObjectId, ref: 'Pricing', required: true },
    stripePaymentIntentId: { type: String, required: true }, // for one-time payment
    stripeCustomerId: { type: String, required: true },
    status: { type: String, required: true }, // e.g., "succeeded", "failed", etc.
    amountPaid: { type: Number }, // in cents
    currency: { type: String, default: 'usd' },
    paymentDate: { type: Date, default: Date.now },
          }
    );
    
    export const subscriptionModel = mongoose.model("Subscription", subscriptionSchema);
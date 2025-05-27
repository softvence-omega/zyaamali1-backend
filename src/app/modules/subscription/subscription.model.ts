import mongoose, { Schema } from "mongoose";
    
    const subscriptionSchema = new mongoose.Schema(
        {
            userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            pricingPlanId: { type: Schema.Types.ObjectId, ref: 'Pricing', required: true },
            stripeSubscriptionId: { type: String, required: true },
            stripeCustomerId: { type: String, required: true },
            currentPeriodEnd: { type: Date, required: true },
            status: { type: String, required: true },
          }
    );
    
    export const subscriptionModel = mongoose.model("Subscription", subscriptionSchema);
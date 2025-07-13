// controllers/subscriptionController.ts
import { NextFunction, Request, Response } from "express";

// Extend the Request interface to include a user property
declare global {
  namespace Express {
    interface User {
      _id: string;
    }
    interface Request {
      user?: User;
    }
  }
}
import { PricingModel } from "../Pricing/Pricing.model";
import { stripe } from "../../utils/stripe";
import { subscriptionModel } from "./subscription.model";
import config from "../../config";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { User } from "../user/user.model";
import mongoose from "mongoose";
import { sendEmail } from "../../utils/PaymentEmail";
import { paymentSuccessTemplate } from "../../utils/templates/paymentSuccessTemplate";


export const createCheckoutSession = async (req: Request, res: Response) => {
  const { pricingPlanId, userId, email } = req.body;

  const plan = await PricingModel.findById(pricingPlanId);
  if (!plan) return res.status(404).json({ message: "Plan not found" });

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  let customerId = user.stripeCustomerId;

  // Create Stripe customer if not exists
  if (!customerId) {
    const customer = await stripe.customers.create({ email });
    customerId = customer.id;

    user.stripeCustomerId = customerId;
    await user.save();
  }


  const currentSubscription = await subscriptionModel.findById(user.currentSubscriptionId);
  if (currentSubscription?.autoRenew && currentSubscription.stripeSubscriptionId) {
    await stripe.subscriptions.update(currentSubscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    currentSubscription.autoRenew = false;
    await currentSubscription.save();
  }

  // Prepare session parameters
   const sessionParams: any = {
    mode: "subscription",
    customer: customerId,
    line_items: [
      {
        price: plan.stripePriceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.CLIENT_URL}/subscription-success`,
    cancel_url: `${process.env.CLIENT_URL}/subscription-cancel`,
    metadata: {
      userId,
      pricingPlanId,
      autoRenew: "true", // Always true for subscription
    },
  };
  // ✅ Create new subscription session only
  const session = await stripe.checkout.sessions.create(sessionParams);

  return res.json({ url: session.url });
};


export const cancelSubscription = async (req: Request, res: Response) => {
  const userId = req.user?._id || req.body.userId;
  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const subscription = await subscriptionModel.findById(user.currentSubscriptionId);

  if (!subscription) {
    return res.status(404).json({ message: "Subscription not found" });
  }

  if (!subscription.stripeSubscriptionId) {
    return res.status(400).json({ message: "Stripe subscription ID is missing" });
  }

  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });
  subscription.autoRenew = false;
  await subscription.save();

  res.json({ message: "Auto-renew cancelled. Will stop after current billing period." });
};


export const reactivateSubscription = async (req: Request, res: Response) => {
   const userId = req.user?._id || req.body.userId;
  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const subscription = await subscriptionModel.findById(user.currentSubscriptionId);

  if (!subscription) {
    return res.status(404).json({ message: "Subscription not found" });
  }

  if (subscription.status !== 'cancelled') {
    return res.status(400).json({ message: "Only cancelled subscriptions can be reactivated" });
  }

  if (!subscription.stripeSubscriptionId) {
    return res.status(400).json({ message: "Stripe subscription ID is missing" });
  }

  const updatedStripeSub = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: false,
  });
  subscription.autoRenew = true;
  await subscription.save();

  res.json({
    message: "Subscription auto-renew reactivated successfully",
    stripeStatus: updatedStripeSub.status,
  });
};


export const getSubscriptionStatus = async (req: Request, res: Response) => {
  try {
      const userId = req.user?._id || req.body.userId;
  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const subscription = await subscriptionModel.findById(user.currentSubscriptionId);

    if (!subscription || subscription.status !== "paid") {
      return res.json({ isActive: false });
    }
    const plan = await PricingModel.findById(subscription.pricingPlanId);
    res.json({ isActive: true , plan }  ); 

  } catch (error) {
    console.error("Error getting subscription status:", error);
    res.status(500).json({ isActive: false, message: "Internal server error" });
  }
};

export const setSubscriptionStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  const userId = req.user?._id || req.body.userId;
  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const subscription = await subscriptionModel.findById(user.currentSubscriptionId);

  if (!subscription) return next();

  const plan = await PricingModel.findById(subscription.pricingPlanId);
  if (!plan) return next();

  const now = new Date();
  const paymentDate = subscription.paymentDate;
  let expiryDate = new Date(paymentDate);

  // Extend based on billing interval
  if (plan.billingInterval === "month") {
    expiryDate.setMonth(expiryDate.getMonth() + 1);
  } else if (plan.billingInterval === "year") {
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  }

  if (now > expiryDate) {
    subscription.status = "expired";
    await subscription.save();

  } else {
    subscription.status = "paid";
    await subscription.save();
  }
  res.json({ message: "Subscription status updated successfully" });
};





export const handleStripeWebhook = async (req: Request, res: Response) => {

  const sig = req.headers['stripe-signature'] as string | undefined;
  const webhookSecret = config.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Missing Stripe signature or webhook secret');
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    throw new ApiError(httpStatus.BAD_REQUEST, `Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;

    if (session.payment_status !== 'paid') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Payment was not successful');
    }

    const sessionDb = await mongoose.startSession();
    sessionDb.startTransaction();

    try {
      const autoRenew = session.metadata?.autoRenew === "true";
      // Save subscription
        const createdSub = await subscriptionModel.create([{
        userId: session.metadata.userId,
        pricingPlanId: session.metadata.pricingPlanId,
        stripePaymentIntentId: session.payment_intent,
        stripeCustomerId: session.customer,
        stripeSubscriptionId: autoRenew ? session.subscription : undefined,
        status: session.payment_status,
        amountPaid: session.amount_total,
        currency: session.currency,
        paymentDate: new Date(session.created * 1000), // Convert to Date
        autoRenew,
      }], { session: sessionDb });


      // Update user currentsubscriptionID if plan exists
      const user = await User.findById(session.metadata.userId).session(sessionDb);

      if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
      }
      user.currentSubscriptionId = createdSub[0]._id;
      await user.save({ session: sessionDb });  



      const pricingPlan = await PricingModel.findById(session.metadata.pricingPlanId).session(sessionDb);
      if (!pricingPlan) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Pricing plan not found');
      } 


      await sessionDb.commitTransaction();
      await sendEmail({
        to: user.email,
        subject: '🎉 Payment Confirmed',
        html: paymentSuccessTemplate(user.fullName, pricingPlan?.name, session.amount_total, session.currency, pricingPlan?.billingInterval || "month"),
      });


    } catch (error) {
      await sessionDb.abortTransaction();
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Stripe webhook processing failed');
    } finally {
      sessionDb.endSession();
    }
  }

  // Handle auto-renew event
if (event.type === "invoice.payment_succeeded") {
  const invoice = event.data.object as any;
  const customerId = invoice.customer;
  const subscriptionId = invoice.subscription;

  const sub = await subscriptionModel.findOne({
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
  });

  if (sub && sub.autoRenew) {
    sub.amountPaid = invoice.amount_paid;
    sub.status = "paid";
    sub.paymentDate = new Date(invoice.created * 1000); // safer
    await sub.save();
  } else {
    console.warn("⚠️ Subscription not found for invoice:", invoice.id);
  }
}

  if (event.type === "customer.subscription.deleted") {
  const subscription = event.data.object as any;
  const subscriptionId = subscription.id;
  const customerId = subscription.customer;

  // Find the correct subscription document
  const sub = await subscriptionModel.findOne({
    stripeSubscriptionId: subscriptionId,
    stripeCustomerId: customerId,
  });

  if (sub) {
    sub.status = "canceled";
    sub.autoRenew = false;
    await sub.save();
  } else {
    console.warn("⚠️ Subscription not found for cancellation:", subscriptionId);
  }
}


  res.status(200).send(); 
};



// export const getLatestUserSubscription = async (req: Request, res: Response) => {
//   const userId = req.user?._id || req.body.userId;

//   if (!userId) {
//     return res.status(400).json({ message: "User ID is required" });
//   }

//   const subscription = await getLatestSubscriptionByUser(userId);

//   if (!subscription) {
//     return res.status(404).json({ message: "No subscription found" });
//   }

//   res.json({ subscription });
// };



// export const checkSubscription = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const userId = req.user?._id || req.body.userId;

//   const subscription = await subscriptionModel
//     .findOne({ userId })
//     .sort({ paymentDate: -1 });

//   if (
//     !subscription ||
//     subscription.status !== "active"
//   ) {
//     return res
//       .status(403)
//       .json({
//         message: "You need an active subscription to access this feature.",
//       });
//   }

//   next();
// };

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
import { getLatestSubscriptionByUser } from "../../utils/subscriptionUtils";

export const createCheckoutSession = async (req: Request, res: Response,) => {
  const { pricingPlanId, userId, email, autoRenew } = req.body;

  const plan = await PricingModel.findById(pricingPlanId);
  if (!plan) return res.status(404).json({ message: "Plan not found" });



  // Fetch the user document by ID
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  let customerId = user.stripeCustomerId;

  // Create one-time if not exists
  if (!customerId) {
    const customer = await stripe.customers.create({ email });
    customerId = customer.id;

    user.stripeCustomerId = customerId;
    await user.save();
  }

  const sessionParams: any = {
    payment_method_types: ["card"],
    customer: customerId,
    line_items: [],
    success_url: `${process.env.CLIENT_URL}/subscription-success`,
    cancel_url: `${process.env.CLIENT_URL}/subscription-cancel`,
    metadata: {
      userId,
      pricingPlanId,
      autoRenew: autoRenew ? "true" : "false",
    },
  };

  if (autoRenew) {

    // ✅ Check existing active auto-renew subscription and cancel it
    const latestSub = await getLatestSubscriptionByUser(userId);

    if (latestSub?.autoRenew && latestSub.stripeSubscriptionId) {
      await stripe.subscriptions.update(latestSub.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      latestSub.autoRenew = false;
      await latestSub.save();
    }

    sessionParams.mode = "subscription";
    sessionParams.line_items = [
      {
        price: plan.stripePriceId,
        quantity: 1,
      },
    ];
  } else {
    sessionParams.mode = "payment";
    sessionParams.line_items = [
      {
        price_data: {
          currency: "usd",
          product_data: { name: plan.name },
          unit_amount: plan.price * 100,
        },
        quantity: 1,
      },
    ];
  }

  const session = await stripe.checkout.sessions.create(sessionParams);
  res.json({ url: session.url });
}

// export const cancelSubscription = async (req: Request, res: Response) => {
//   const { subscriptionId } = req.body;

//   const subscription = await subscriptionModel.findOne({
//     stripeSubscriptionId: subscriptionId,
//   });
//   if (!subscription)
//     return res.status(404).json({ message: "Subscription not found" });

//   await stripe.subscriptions.cancel(subscriptionId);
//   subscription.status = "canceled";
//   await subscription.save();

//   res.json({ message: "Subscription canceled" });
// };

export const cancelSubscription = async (req: Request, res: Response) => {
  const userId = req.user?._id || req.body.userId;

  const subscription = await getLatestSubscriptionByUser(userId);

  if (!subscription) {
    return res.status(404).json({ message: "Subscription not found" });
  }

  if (!subscription.stripeSubscriptionId) {
    return res.status(400).json({ message: "Stripe subscription ID is missing" });
  }

  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  subscription.status = "cancelled";
  subscription.autoRenew = false;
  await subscription.save();

  res.json({ message: "Auto-renew cancelled. Will stop after current billing period." });
};


export const reactivateSubscription = async (req: Request, res: Response) => {
  const userId = req.user?._id || req.body.userId;

  const subscription = await getLatestSubscriptionByUser(userId);

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

  subscription.status = 'active';
  subscription.autoRenew = true;
  await subscription.save();

  res.json({
    message: "Subscription auto-renew reactivated successfully",
    stripeStatus: updatedStripeSub.status,
  });
};


export const getLatestUserSubscription = async (req: Request, res: Response) => {
  const userId = req.user?._id || req.body.userId;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const subscription = await getLatestSubscriptionByUser(userId);

  if (!subscription) {
    return res.status(404).json({ message: "No subscription found" });
  }

  res.json({ subscription });
};



export const checkSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?._id || req.body.userId;

  const subscription = await subscriptionModel
    .findOne({ userId })
    .sort({ paymentDate: -1 });

  if (
    !subscription ||
    subscription.status !== "active"
  ) {
    return res
      .status(403)
      .json({
        message: "You need an active subscription to access this feature.",
      });
  }

  next();
};

export const getSubscriptionStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id || req.body.userId;

    const subscription = await subscriptionModel
      .findOne({ userId })
      .sort({ paymentDate: -1 }); // latest subscription

    if (!subscription || subscription.status !== "active") {
      return res.json({ isActive: false });
    }

    res.json({ isActive: true });
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
  const subscription = await subscriptionModel
    .findOne({ userId })
    .sort({ paymentDate: -1 });

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
    subscription.status = "active";
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
      await subscriptionModel.create([{
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


      // Update user tokens if plan exists
      if (session.metadata.pricingPlanId) {
        const pricingPlan = await PricingModel.findById(session.metadata.pricingPlanId).session(sessionDb);
        if (!pricingPlan) {
          throw new ApiError(httpStatus.NOT_FOUND, 'Pricing plan not found');
        }

        await User.findByIdAndUpdate(
          session.metadata.userId,
          { credit: pricingPlan.totalCredits },
          { new: true, session: sessionDb }
        );
      }

      await sessionDb.commitTransaction();
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

    const sub = await subscriptionModel.findOne({ stripeCustomerId: customerId });
    if (sub && sub.autoRenew) {
      sub.amountPaid = invoice.amount_paid;
      sub.status = "active";
      sub.paymentDate = new Date();
      await sub.save();

      const plan = await PricingModel.findById(sub.pricingPlanId);
      if (plan) {
        await User.findByIdAndUpdate(sub.userId, {
          credit: plan.totalCredits,
        });
      }
    }
  }
  // Handle subscription cancellation
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as any;
    const sub = await subscriptionModel.findOne({ stripeSubscriptionId: subscription.id });
    if (sub) {
      sub.status = "canceled";
      sub.autoRenew = false;
      await sub.save();
    }
  }

  res.status(200).send(); // Acknowledge webhook to Stripe
};



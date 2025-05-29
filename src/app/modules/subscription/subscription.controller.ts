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

export const createCheckoutSession = async (req: Request, res: Response) => {
  const { pricingPlanId, userId, email } = req.body;

  const plan = await PricingModel.findById(pricingPlanId);
  if (!plan) return res.status(404).json({ message: "Plan not found" });

  const customer = await stripe.customers.create({ email });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    customer: customer.id,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: plan.name,
          },
          unit_amount: plan.price * 100, // USD in cents
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.CLIENT_URL}/subscription-success`,
    cancel_url: `${process.env.CLIENT_URL}/subscription-cancel`,
    metadata: {
      userId,
      pricingPlanId,
    },
  });

  res.json({ url: session.url });
};

export const cancelSubscription = async (req: Request, res: Response) => {
  const { subscriptionId } = req.body;

  const subscription = await subscriptionModel.findOne({
    stripeSubscriptionId: subscriptionId,
  });
  if (!subscription)
    return res.status(404).json({ message: "Subscription not found" });

  await stripe.subscriptions.cancel(subscriptionId);
  subscription.status = "canceled";
  await subscription.save();

  res.json({ message: "Subscription canceled" });
};

export const checkSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?._id || req.body.userId;

  const subscription = await subscriptionModel
    .findOne({ userId })
    .sort({ currentPeriodEnd: -1 });

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
  const userId = req.user?._id || req.body.userId;

  const subscription = await subscriptionModel.findOne({ userId }).sort({ currentPeriodEnd: -1 });

  if (!subscription) {
    return res.json({ isActive: false });
  }

  const isActive =
    subscription.status === 'active';

  res.json({ isActive });
};

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string | undefined;
  const webhookSecret = config.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    throw new Error("Missing signature or webhook secret")
  }

  let event;

  try {
    // IMPORTANT: req.body is a Buffer because of express.raw()
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    console.log('Stripe event:', event);
  } catch (err: any) {
    console.error('Webhook signature verification failed.', err.message);
    throw new Error(`Webhook Error: ${err.message}`)
  }

  // Your event handling logic here
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    console.log('Checkout session completed:', session);


    await subscriptionModel.create({
      userId: session.metadata.userId,
      pricingPlanId: session.metadata.pricingPlanId,
      stripePaymentIntentId: session.payment_intent,
      stripeCustomerId: session.customer,
      status: session.payment_status,
      amountPaid: session.amount_total,
      currency: session.currency,
    });
  }

  return res.status(200).send();
};




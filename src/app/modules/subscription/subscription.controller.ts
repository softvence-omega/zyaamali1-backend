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
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ],
    mode: "subscription",
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
    subscription.status !== "active" ||
    new Date() > subscription.currentPeriodEnd
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
    subscription.status === 'active' && new Date() < new Date(subscription.currentPeriodEnd);

  res.json({ isActive });
};

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig!, webhookSecret);
  } catch (err: any) {
    console.error('⚠️ Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;

    try {
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
console.log("session", session)
      await subscriptionModel.create({
        userId: session.metadata.userId,
        pricingPlanId: session.metadata.pricingPlanId,
        stripeSubscriptionId: session.subscription,
        stripeCustomerId: session.customer,
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        status: subscription.status,
      });

      console.log('✅ Subscription saved for user:', session.metadata.userId);
    } catch (err) {
      console.error('❌ Error saving subscription:', err);
      return res.status(500).send('Internal Server Error');
    }
  }

  res.status(200).send(); // Always respond with 200 to Stripe
};
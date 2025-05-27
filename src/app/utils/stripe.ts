// utils/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
// Don't set `apiVersion` unless you *really* need to use a specific version

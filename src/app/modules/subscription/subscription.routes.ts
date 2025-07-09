import express from "express";
import {
  cancelSubscription,
  checkSubscription,
  createCheckoutSession,
  getSubscriptionStatus,
  handleStripeWebhook,
} from "./subscription.controller";
import USER_ROLE from "../../constants/userRole";
import auth from "../../middleWear/auth";

const router = express.Router();


router.post("/create-checkout-session", auth(USER_ROLE.ADMIN), createCheckoutSession);

router.post("/cancel-subscription", cancelSubscription);

router.get("/subscription-status", getSubscriptionStatus);


export const subscriptionRoutes = router;


import express from "express";
import {
  cancelSubscription,
  checkSubscription,
  handleStripeWebhook,
  createCheckoutSession,
  getSubscriptionStatus,
} from "./subscription.controller";
import USER_ROLE from "../../constants/userRole";
import auth from "../../middleWear/auth";

const router = express.Router();

router.post("/create-checkout-session",  auth(USER_ROLE.ADMIN), createCheckoutSession);
router.post("/cancel",auth(USER_ROLE.ADMIN), cancelSubscription);
router.get("/status", getSubscriptionStatus);


export const subscriptionRoutes = router;


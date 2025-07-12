import express from "express";
import {
  cancelSubscription,
  handleStripeWebhook,
  createCheckoutSession,
  getSubscriptionStatus,
  setSubscriptionStatus,
  reactivateSubscription,
} from "./subscription.controller";
import USER_ROLE from "../../constants/userRole";
import auth from "../../middleWear/auth";

const router = express.Router();

router.post("/create-checkout-session",  auth(USER_ROLE.ADMIN), createCheckoutSession);
router.post("/cancel",auth(USER_ROLE.ADMIN), cancelSubscription);
router.post("/reactivate", auth(USER_ROLE.ADMIN), reactivateSubscription);
router.get("/status", getSubscriptionStatus);
router.post("/setstatus", setSubscriptionStatus);


export const subscriptionRoutes = router;


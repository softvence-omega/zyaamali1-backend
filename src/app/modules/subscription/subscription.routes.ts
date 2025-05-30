import express from "express";
import {
  cancelSubscription,
  checkSubscription,
  createCheckoutSession,
  getSubscriptionStatus,
} from "./subscription.controller";
import USER_ROLE from "../../constants/userRole";
import auth from "../../middleWear/auth";

const router = express.Router();


router.post("/create-checkout-session",  auth(USER_ROLE.USER), createCheckoutSession);
router.post("/cancel-subscription", cancelSubscription);

router.get("/subscription-status", getSubscriptionStatus);


export const subscriptionRoutes = router;


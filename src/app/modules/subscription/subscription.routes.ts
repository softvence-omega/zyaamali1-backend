import express from "express";
import {
  cancelSubscription,
  checkSubscription,
  createCheckoutSession,
  getSubscriptionStatus,
} from "./subscription.controller";

const router = express.Router();


router.post("/create-checkout-session", createCheckoutSession);
router.post("/cancel-subscription", cancelSubscription);
router.get("/premium-data", checkSubscription, (req, res) => {
  res.json({ message: "Welcome to premium features!" });
});
router.get("/subscription-status", getSubscriptionStatus);


export const subscriptionRoutes = router;


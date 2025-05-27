import express from "express";
import bodyParser from "body-parser";
import {
  cancelSubscription,
  checkSubscription,
  createCheckoutSession,
  getSubscriptionStatus,
  handleStripeWebhook,
} from "./subscription.controller";

const router = express.Router();

router.post("/create-checkout-session", createCheckoutSession);
router.post("/cancel-subscription", cancelSubscription);
router.get("/premium-data", checkSubscription, (req, res) => {
  res.json({ message: "Welcome to premium features!" });
});
router.get("/subscription-status", getSubscriptionStatus);
router.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  handleStripeWebhook
);

export const subscriptionRoutes = router;

//     // in frontend
// const res = await axios.get('/api/subscriptions/subscription-status');
// if (res.data.isActive) {
//   // show premium UI
// } else {
//   // redirect to pricing page
// }

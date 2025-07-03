import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { ConversationRoutes } from "../modules/conversation/conversation.routes";
import { PricingRoutes } from "../modules/Pricing/Pricing.routes";
import { subscriptionRoutes } from "../modules/subscription/subscription.routes";
import { configureRoutes } from "../modules/configure/configure.routes";
import { connectAdsAccountRoutes } from "../modules/connectAdsAccount/connectAdsAccount.route";
import { createCampaignRoute } from "../modules/createCampaign/createCampaign.route";

const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/connect",
    route: connectAdsAccountRoutes,
  },
  {
    path: "/pricing",
    route: PricingRoutes,
  },
  {
    path: "/configure",
    route: configureRoutes,
  },

  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/subscriptions",
    route: subscriptionRoutes,
  },
  {
    path: "/conversations",
    route: ConversationRoutes,
  },
  {
    path: "/ads",
    route: createCampaignRoute,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;

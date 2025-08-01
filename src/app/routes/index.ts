import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { ConversationRoutes } from "../modules/conversation/conversation.routes";
import { PricingRoutes } from "../modules/Pricing/Pricing.routes";
import { subscriptionRoutes } from "../modules/subscription/subscription.routes";
import { configureRoutes } from "../modules/configure/configure.routes";
import { connectAdsAccountRoutes } from "../modules/connectAdsAccount/connectAdsAccount.route";
import { businessRoutes } from "../modules/business/business.route";
import { viewerRoutes } from "../modules/viewer/viewer.routes";
import { creatorRoutes } from "../modules/creator/creator.routes";
import { contentRoutes } from "../modules/content/content.routes";
import { createAdsCampaignRoute } from "../modules/createCampaign/createCampaign.route";

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
    path: "/user",
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
    route: createAdsCampaignRoute,
  },
  {
    path: "/business",
    route: businessRoutes,
  },
  {
    path: "/viewer",
    route: viewerRoutes,
  },
  {
    path: "/creator",
    route: creatorRoutes,
  },
  {
    path: "/content",
    route: contentRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;

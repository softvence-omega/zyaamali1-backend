import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { ConversationRoutes } from "../modules/conversation/conversation.routes";
import { PricingRoutes } from "../modules/Pricing/Pricing.routes";
import { subscriptionRoutes } from "../modules/subscription/subscription.routes";
import { configureRoutes } from "../modules/configure/configure.routes";
import { businessRoutes } from "../modules/business/business.route";

const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
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
    path: "/business",
    route: businessRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;

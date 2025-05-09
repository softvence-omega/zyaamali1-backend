import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { ConversationRoutes } from "../modules/conversation/conversation.routes";
import { cartRoutes } from "../modules/cart/cart.routes";
import { paymentRoutes } from "../modules/payment/payment.routes";
import { PricingRoutes } from "../modules/Pricing/Pricing.routes";

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
    path: "/cart",
    route: cartRoutes,
  },
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/payment",
    route: paymentRoutes,
  },
  {
    path: "/conversations",
    route: ConversationRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;

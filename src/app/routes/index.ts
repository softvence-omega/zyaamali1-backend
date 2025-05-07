import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { ConversationRoutes } from "../modules/conversation/conversation.routes";
import { cartRoutes } from "../modules/cart/cart.routes";

const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
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
    path: "/conversations",
    route: ConversationRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;

import { Router } from "express";
import { conversationController } from "./conversation.controller";
import auth from "../../middleWear/auth";
import USER_ROLE from "../../constants/userRole";
import { upload } from "../../utils/sendFileToCloudinary";
import { validateRequest } from "../../middleWear/validateRequest";
import { ConversationValidations } from "./conversation.validation";

const router = Router();

router.post(
  "/create-conversation",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  conversationController.createConversartion
);

router.post(
  "/add-message",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  upload.fields([
    { name: "promptFile", maxCount: 10 },
    { name: "responseFile", maxCount: 10 },
  ]),
  conversationController.addAMessage
);

router.get(
  "/",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  conversationController.getAllConversations
);

router.get(
  "/:conversationId",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  conversationController.getMessagesFromConversation
);

router.delete(
  "/delete-conversation/:conversationId",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  conversationController.deleteConversation
);

router.patch(
  "/change-name/:conversationId",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  validateRequest(
    ConversationValidations.updateConversationNameValidationSchema
  ),
  conversationController.changeConversationName
);

export const ConversationRoutes = router;

import { z } from "zod";

const updateConversationNameValidationSchema = z.object({
  body: z.object({
    name: z.string(),
  }),
});

export const ConversationValidations = {
  updateConversationNameValidationSchema,
};

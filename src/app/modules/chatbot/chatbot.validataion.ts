import { z } from "zod";

export const createUserValidationSchema = z.object({
  body: z.object({
    sessionId: z.string().emoji("Invalid session ID format"),
    userId: z.string().optional(),
    userQuestion: z.string(),
    aiAnswer: z.string(),
  }),
});

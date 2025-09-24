import { z } from "zod";

export const createUserValidationSchema = z.object({
  body: z.object({
      sessionId: z.string().emoji("Invalid session ID format"),
 
    userQuestion: z.string(),
    aiAnswer: z.string(),
  }),
});


import { z } from "zod";

export const createUserValidationSchema = z.object({
  body: z.object({
    userId: z.string().emoji("Invalid user ID format"),
    userQuestion: z.string(),
    aiAnswer: z.string(),
  }),
});

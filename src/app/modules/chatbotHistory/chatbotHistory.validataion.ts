import { title } from "process";
import { z } from "zod";

export const createUserValidationSchema = z.object({
  body: z.object({
    sessionId: z.string().emoji("Invalid session ID format"),
   title: z.string().min(3, "Title must be at least 3 characters long").max(100, "Title must be at most 100 characters long"),
  }),
});

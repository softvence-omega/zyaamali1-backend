import { z } from "zod";

export const viewerUpdateValidation = z.object({
  fullName: z.string().min(10, { message: "Full name cannot be empty" }).optional(),
});

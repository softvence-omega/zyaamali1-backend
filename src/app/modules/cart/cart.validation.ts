import { z } from "zod";

export const cartPostValidation = z.object({
  body:z.object({
    title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(["image", "video"]),
  file: z.string().url("File must be a valid URL"),

  price: z.number().min(0),
  quantity: z.number().int().min(1),
  })
});

export const cartUpdateValidation = cartPostValidation.partial();

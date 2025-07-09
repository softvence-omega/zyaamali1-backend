import { z } from "zod";

export const PricingPostValidation = z.object({
  body: z.object({
    name: z
      .string({
        required_error: "Plan name is required",
      })
      .min(1, "Plan name cannot be empty"),

    usedCase: z
      .string({
        required_error: "Used case is required",
      })
      .min(1, "Used case cannot be empty"),

    price: z
      .number({
        required_error: "Price is required",
      })
      .nonnegative("Price cannot be negative"),

    totalCredits: z.number({
      required_error: "totalCredits is required",
    }),

  }),
});

export const PricingUpdateValidation = PricingPostValidation.partial();

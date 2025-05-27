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

    dailyCredits: z
      .number({
        required_error: "Daily credits are required",
      })
      .int("Daily credits must be an integer")
      .nonnegative("Daily credits cannot be negative"),

    totalCredits: z
      .number({
        required_error: "Total credits are required",
      })
      .int("Total credits must be an integer")
      .nonnegative("Total credits cannot be negative"),

    Storage: z
      .number({
        required_error: "Storage is required",
      })
      .nonnegative("Storage cannot be negative"),

    isDelete: z.boolean().optional(),
  }),
});

export const PricingUpdateValidation = PricingPostValidation.partial();

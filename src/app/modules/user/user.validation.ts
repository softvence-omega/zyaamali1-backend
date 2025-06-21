import { z } from "zod";
import { LANGUAGE } from "./user.constants";


export const createUserValidationSchema = z.object({
  body: z.object({
    fullName: z.string().min(1, "Full name is required"),
    companyName: z.string().optional(),
    image: z.string().url("Image must be a valid URL").nullable().optional(),
    country: z.string().nullable().optional(),
    email: z.string().email("Invalid email format"),
    password: z.string().max(20, "Password can't exceed 20 characters").optional(),
    provider: z.string().nullable().optional(),
    role: z.enum(["superAdmin", "admin", "creator", "viewer"]).default("viewer"),

    credit: z.number().min(0, "Credit must be at least 0").default(0),

  }).refine((data) => {

    if (!data.password && !data.provider) {
      return false;
    }
    return true;
  }, {
    message: "Password is required if provider is not set",
    path: ["password"],
  }).refine((data) => {

    if (data.role === "admin" && !data.companyName) {
      return false;
    }
    return true;
  }, {
    message: "Company name is required when role is 'admin'",
    path: ["companyName"],
  }),
});
const changeLanguageValidationSchema = z.object({
  body: z.object({
    language: z.enum([...LANGUAGE] as [string, ...string[]]),
  }),
});

const changeThemeValidationSchema = z.object({
  body: z.object({
    theme: z.enum(["light", "dark", "system"]),
  }),
});
const deleteUserValidationSchema = z.object({
  body: z.object({
    deleted: z.boolean(),
  }),
});

export const UserValidations = {
  createUserValidationSchema,
  changeLanguageValidationSchema,
  changeThemeValidationSchema,
  deleteUserValidationSchema,
};

import { z } from "zod";
import { LANGUAGE } from "./user.constants";


export const createUserValidationSchema = z.object({
  body: z.object({
    fullName: z.string().min(1, "Full name is required"),
    companyName: z.string(),
    country: z.string(),
    email: z.string().email("Invalid email format"),
    password: z.string().max(20, "Password can't exceed 20 characters")
  })
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

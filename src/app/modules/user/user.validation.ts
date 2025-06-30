import { z } from "zod";
import { LANGUAGE } from "./user.constants";

const createUserValidationSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().max(20),
    fullName: z.string(),
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

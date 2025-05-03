import { z } from "zod";

const createUserValidationSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().max(20),
    name: z.string(),
    role: z.enum(["lawyer", "admin", "client"]),
  }),
});

export const UserValidations = {
  createUserValidationSchema,
};

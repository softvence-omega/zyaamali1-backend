import { z } from "zod";

const createUserValidationSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().max(20),
    name: z.string(),
    

  }),
});

export const UserValidations = {
  createUserValidationSchema,
};

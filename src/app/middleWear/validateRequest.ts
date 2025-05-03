import { AnyZodObject } from "zod";
import { catchAsync } from "../utils/catchAsync";

// HOF is used so that we can pass parameter inside the middleware. Otherwise passing parameter was not possible
export const validateRequest = (schema: AnyZodObject) => {
  return catchAsync(async (req, res, next) => {
    await schema.parseAsync({ body: req.body, cookies: req.cookies });
    return next();
  });
};

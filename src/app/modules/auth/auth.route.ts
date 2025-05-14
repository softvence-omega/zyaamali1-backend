import express from "express";
import { AuthControllers } from "./auth.controller";
import { validateRequest } from "../../middleWear/validateRequest";
import { AuthValidation } from "./auth.validation";
import USER_ROLE from "../../constants/userRole";
import auth from "../../middleWear/auth";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { handleGoogleAuth } from "./auth.service";
import config from "../../config";

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: config.google_client_id!,
//       clientSecret: config.google_client_secret!,
//       callbackURL: `${config.google_callback_url}/api/v1/auth/google/callback`,
//     },
//     async (_accessToken, _refreshToken, profile, done) => {
//       try {
//         const user = await handleGoogleAuth(profile);
//         return done(null, user);
//       } catch (err) {
//         return done(err as any, false);
//       }
//     }
//   )
// );

const router = express.Router();

router.post(
  "/login",
  validateRequest(AuthValidation.loginValidationSchema),
  AuthControllers.loginUser
);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  AuthControllers.googleCallback
);

router.post(
  "/change-password",
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  validateRequest(AuthValidation.changePasswordValidationSchema),
  AuthControllers.changePassword
);

router.post(
  "/refresh-token",
  validateRequest(AuthValidation.refreshTokenValidationSchema),
  AuthControllers.refreshToken
);

router.post(
  "/forget-password",
  validateRequest(AuthValidation.forgetPasswordValidationSchema),
  AuthControllers.forgetPassword
);
export const AuthRoutes = router;

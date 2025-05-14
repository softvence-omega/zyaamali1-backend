import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { handleGoogleAuth } from "./auth.service";
import config from "../../config";

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google_client_id!,
      clientSecret: config.google_client_secret!,
      callbackURL: `${config.google_callback_url}/api/v1/auth/google`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const user = await handleGoogleAuth(profile);
        return done(null, user);
      } catch (err) {
        return done(err as any, false);
      }
    }
  )
);

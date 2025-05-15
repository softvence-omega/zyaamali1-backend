import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import config from "../config";
import { User } from "../modules/user/user.model";
import ApiError from "../errors/ApiError";
import httpStatus from "http-status";

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google_client_id!,
      clientSecret: config.google_client_secret!,
      callbackURL: `${config.google_callback_url}/api/v1/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        // const user = await handleGoogleAuth(profile);
        const email = profile.emails?.[0]?.value;
        let user = await User.findOne({ email });
        if (user) {
          if (user.isDeleted) {
            return done(
              new ApiError(httpStatus.FORBIDDEN, "This user is deleted!"),
              null!
            );
          }
          return done(null, user);
        }

        user = await User.create({
          name: profile.displayName,
          email,
          image: profile.photos?.[0]?.value,
          provider: profile.provider,
        });

        return done(null, user);
      } catch (err) {
        return done(err as any, null!);
      }
    }
  )
);

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
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new ApiError(httpStatus.BAD_REQUEST, "Email not found in Google profile"), null!);
        }

        let user = await User.findOne({ email });

        if (user) {
          if (user.isDeleted) {
            return done(new ApiError(httpStatus.FORBIDDEN, "This user is deleted!"), null!);
          }

          // 🚫 User registered with password, disallow Google login
          if (!user.provider) {
            return done(
              new ApiError(httpStatus.BAD_REQUEST, "This account was created with email/password. Use regular login."),
              null!
            );
          }

          return done(null, {
            ...user.toObject(),
            _id: user._id.toString(),
          });
        }

        // ✅ Create new user using Google
        user = await User.create({
          fullName: profile.displayName,
          email,
          companyName: "Your company",
          image: profile.photos?.[0]?.value,
          provider: profile.provider,
        });

        return done(null, {
          ...user.toObject(),
          _id: user._id.toString(),
        });
      } catch (err) {
        return done(err as any, null!);
      }
    }
  )
);


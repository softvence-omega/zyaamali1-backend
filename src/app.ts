import express, { Request, Response } from "express";
import cors from "cors";
import router from "./app/routes";
import globalErrorHandler from "./app/middleWear/globalErrorHandler";
import notFound from "./app/middleWear/notFound";
import cookieParser from "cookie-parser";
import "./app/middleWear/passport";
import passport from "passport";
import { User } from "./app/modules/user/user.model";
import bcrypt from "bcrypt";
import config from "./app/config";
import { configureModel } from "./app/modules/configure/configure.model";
import { handleStripeWebhook } from "./app/modules/subscription/subscription.controller";
import "./app/utils/dailyTokenReset"; // Importing the daily token reset utility to ensure it's executed
import { googleAuthCallback } from "./app/modules/connectAdsAccount/connectAdsAccount.controller";
const app = express();

app.post(
  "/api/v1/subscription/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

// Middlewares
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend
    credentials: true, // 🔥 allow cookies
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

router.get("/google/callback", googleAuthCallback);

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello harmonia!");
});

export const createDefaultSuperAdmin = async () => {
  try {
    const existingSuperAdmin = await User.findOne({
      email: "mohibullamiazi@gmail.com",
    });

    const hashedPassword = await bcrypt.hash(
      "SuperAdmin123",
      Number(config.bcrypt_salt_rounds)
    );

    if (!existingSuperAdmin) {
      await User.create({
        fullName: "Platform Super Admin",
        email: "mohibullamiazi@gmail.com",
        password: hashedPassword,
        companyName: "AI Ads HQ",
        role: "superAdmin",
        isActive: true,
        isVerified: true,
        credit: 999999, // optional: give high credits
        country: "Global",
      });
      console.log("✅ Default superAdmin created.");
    } else {
      console.log("ℹ️ SuperAdmin already exists.");
    }
  } catch (error) {
    console.error("❌ Failed to create default superAdmin:", error);
  }
};

createDefaultSuperAdmin();

const postConfigureIntoDB = async () => {
  try {
    const count = await configureModel.countDocuments();
    if (count > 0) {
      console.log("ℹ️ Configuration already exists in the database.");
    } else {
      return await configureModel.create({
        dollerPerToken: 5,
        dailyTokenLimit: 100,
      });
    }
  } catch (error: unknown) {
    throw error;
  }
};

postConfigureIntoDB();

app.use(notFound);
app.use(globalErrorHandler);

export default app;

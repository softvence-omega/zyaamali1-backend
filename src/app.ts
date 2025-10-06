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
import { chatbotModel } from "./app/modules/chatbot/chatbot.model";
import { chatbotHistoryModel } from "./app/modules/chatbotHistory/chatbotHistory.model";
const cron = require("node-cron");

const app = express();

// Stripe Webhook
app.post(
  "/api/v1/subscription/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

// Middlewares
app.use(
  cors({
    origin: ["http://localhost:5173", "https://adelo.ai"], // your frontend

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // allow all needed methods
    credentials: true, // allow cookies
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello Harmonia!");
});

cron.schedule("0 0 * * *", async () => {
  console.log("Running the cleanup task every 1 minute");
  // Set the time limit to 2 minutes ago
  const timeLimit = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000); // 30 days ago
  console.log("Current Time:", new Date());
  console.log("Time Limit (2 mins ago):", timeLimit);

  try {
    // Delete messages older than 2 minutes (based on the createdAt timestamp)
    const result = await chatbotModel.deleteMany({
      createdAt: { $lt: timeLimit },
    });
    console.log(`${result.deletedCount} old messages deleted.`);
    if (result.deletedCount === 0) {
      console.log("No old messages found.");
    }
  } catch (error) {
    console.error("Error deleting old messages:", error);
  }
});

cron.schedule("0 0 * * *", async () => {
  console.log("Running the cleanup task every 1 minute");
  // Set the time limit to 2 minutes ago
  const timeLimit = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000); // 30 days ago
  console.log("Current Time:", new Date());
  console.log("Time Limit (1 mins ago):", timeLimit);

  try {
    // Delete messages older than 2 minutes (based on the createdAt timestamp)
    const result = await chatbotHistoryModel.deleteMany({
      createdAt: { $lt: timeLimit },
    });
    console.log(`${result.deletedCount} old messages deleted.`);
    if (result.deletedCount === 0) {
      console.log("No old messages found.");
    }
  } catch (error) {
    console.error("Error deleting old messages:", error);
  }
});

// Create Default SuperAdmin if not exists
export const createDefaultSuperAdmin = async () => {
  try {
    const existingSuperAdmin = await User.findOne({
      email: "mohibullamiazi@gmail.com",
    });

    const hashedPassword = await bcrypt.hash(
      "SuperAdmin123",
      Number(config.bcrypt_salt_rounds) // Ensure bcrypt_salt_rounds is correctly pulled from config
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
      console.log("✅ Default SuperAdmin created.");
    } else {
      console.log("ℹ️ SuperAdmin already exists.");
    }
  } catch (error) {
    console.error("❌ Failed to create Default SuperAdmin:", error);
  }
};

createDefaultSuperAdmin();

// Post Configuration into DB if not exists
const postConfigureIntoDB = async () => {
  try {
    const count = await configureModel.countDocuments();

    if (count > 0) {
      console.log("ℹ️ Configuration already exists in the database.");
    } else {
      await configureModel.create({
        dollerPerToken: 5,
        dailyTokenLimit: 100,
      });
      console.log("✅ Configuration created in DB.");
    }
  } catch (error: unknown) {
    console.error("❌ Error while posting configuration into DB:", error);
    throw error;
  }
};

postConfigureIntoDB();

// Error Handling
app.use(notFound);
app.use(globalErrorHandler);

export default app;

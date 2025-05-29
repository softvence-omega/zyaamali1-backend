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
import ApiError from "./app/errors/ApiError";
import httpStatus from "http-status";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello harmonia!");
});

export const createDefaultAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ email: "mohibullamiazi@gmail.com" });
     const newHashedPassword = await bcrypt.hash(
       "Admin123",
       Number(config.bcrypt_salt_rounds)
     );
   
    if (!existingAdmin) {
      await User.create({
        name: "Mohebulla miazi",
        email: "mohibullamiazi@gmail.com",
        password: newHashedPassword, // You should hash this if your schema requires
        role: "admin",
        token: 0,
      });
      console.log("✅ Default admin created");
    } else {
      console.log("ℹ️ Admin already exists");
    }
  } catch (error) {
    console.error("❌ Error creating default admin:", error);
  }
};

createDefaultAdmin();

const postConfigureIntoDB = async(data: any) => {
    try {
     const count = await configureModel.countDocuments();
     if(count > 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Configure already exists, you can only update it.")
     }else{
       return await configureModel.create(data);
     }
    } catch (error: unknown) {
      throw error;
    }
  }

// Error handler middlewear is positioned after all the routes definition because after the routes are handled then error will occur, not before
app.use(notFound);
app.use(globalErrorHandler);

export default app;

import { Model } from "mongoose";
import USER_ROLE from "../../constants/userRole";

export interface TUser {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type TUserRole = keyof typeof USER_ROLE;

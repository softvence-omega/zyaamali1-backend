import { Model } from "mongoose";
import USER_ROLE from "../../constants/userRole";

export interface TUser {
  name: string;
  image?: string | null;
  email: string;
  password: string;
  role: "user" | "admin";
  isDeleted: boolean;
  provider?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TUserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

import { Model } from "mongoose";
import USER_ROLE from "../../constants/userRole";

export interface TUser {
  email: string;
  password: string;
  name: string;
  role: "lawyer" | "admin" | "client";
  status: "in-progress" | "blocked";
  isDeleted: boolean;
}

export type TUserRole = keyof typeof USER_ROLE;

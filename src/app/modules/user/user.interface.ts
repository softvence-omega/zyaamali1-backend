import { Types } from "mongoose";
import USER_ROLE from "../../constants/userRole";



export interface TUser {
  _id: string;
  fullName: string;
  companyName: string;
  image?: string | null;
  country?: string | null;
  email: string;
  password?: string;
  role: "superAdmin" | "admin" | "creator" | "viewer";
  credit?: number;
  stripeCustomerId?: string | null; // Stripe customer ID for subscription management
  isDeleted: boolean;
  isActive?: boolean;
  provider?: string;
  createdBy: Types.ObjectId | null;
  teamMembers: Types.ObjectId[];      // যাদের এই user‑এর অধীনে যোগ করা হয়েছে

  createdAt?: Date;
  updatedAt?: Date;
}

export type TUserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

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
  stripeCustomerId?: string | null; // Stripe customer ID for subscription management
  currentSubscriptionId?: Types.ObjectId | null; // Reference to the current subscription
  isDeleted: boolean;
  provider?: string;
  createdBy: Types.ObjectId | null;
  teamMembers: Types.ObjectId[]; 

  createdAt?: Date;
  updatedAt?: Date;
}

export type TUserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

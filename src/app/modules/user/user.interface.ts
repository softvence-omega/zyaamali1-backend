import { Types } from "mongoose";
import USER_ROLE from "../../constants/userRole";

export type TLanguage =
  | "Amharic"
  | "Arabic"
  | "Bengali"
  | "Burmese"
  | "Dutch"
  | "English"
  | "French"
  | "German"
  | "Gujarati"
  | "Hausa"
  | "Hindi"
  | "Indonesian"
  | "Italian"
  | "Japanese"
  | "Kannada"
  | "Korean"
  | "Malay"
  | "Malayalam"
  | "Mandarin Chinese"
  | "Marathi"
  | "Odia"
  | "Pashto"
  | "Persian"
  | "Polish"
  | "Portuguese"
  | "Punjabi"
  | "Romanian"
  | "Russian"
  | "Sindhi"
  | "Spanish"
  | "Swahili"
  | "Tamil"
  | "Telugu"
  | "Thai"
  | "Turkish"
  | "Ukrainian"
  | "Urdu"
  | "Vietnamese"
  | "Yoruba";

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
  isDeleted: boolean;
  isActive?: boolean;
  provider?: string;
  createdBy: Types.ObjectId | null;
  teamMembers: Types.ObjectId[];     
  onBoardingcompleted: boolean; 
  createdAt?: Date;
  updatedAt?: Date;
}

export type TUserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

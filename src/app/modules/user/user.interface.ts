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
  name: string;
  image?: string;
  email: string;
  password: string;
  role: "user" | "admin";
  isVerified: boolean;
  verificationCode?: string;
  verificationCodeExpiresAt?: Date;
  lastVerificationSentAt?: Date;
  token: number;
  theme: "dark" | "light" | "system";
  language: TLanguage;
  isDeleted: boolean;
  provider?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TUserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

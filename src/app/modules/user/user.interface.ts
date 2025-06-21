import USER_ROLE from "../../constants/userRole";



export interface TUser {
  fullName: string;
  companyName: string;
  image?: string | null;
  country?: string | null;
  email: string;
  password?: string;
  isVerified: boolean;
  verificationCode?: string | null;
  verificationCodeExpiresAt?: Date | null;
  lastVerificationSentAt?: Date | null;
  role: "superAdmin" | "admin" | "creator" | "viewer";
  credit: number;
  isDeleted: boolean;
  isActive: boolean;
  provider?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TUserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

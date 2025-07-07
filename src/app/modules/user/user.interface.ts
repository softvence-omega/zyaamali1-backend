import USER_ROLE from "../../constants/userRole";



export interface TUser {
  _id:string;
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
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TUserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

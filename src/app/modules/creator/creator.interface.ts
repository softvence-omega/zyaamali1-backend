import { Types } from "mongoose";

// viewer.interface.ts
export interface TCreator {
  fullName: string;
  email: string;
  role: "creator";  // fixed role
  isDeleted?: boolean;
  isActive?: boolean;
  userId: Types.ObjectId; // reference to User model
  createdBy: Types.ObjectId
}

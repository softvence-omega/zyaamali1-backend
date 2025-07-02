import { Types } from "mongoose";

// viewer.interface.ts
export interface TViewer {
  fullName: string;
  email: string;
  role: "viewer";  // fixed role
  isDeleted?: boolean;
  userId: Types.ObjectId; // reference to User model
  createdBy: Types.ObjectId
}

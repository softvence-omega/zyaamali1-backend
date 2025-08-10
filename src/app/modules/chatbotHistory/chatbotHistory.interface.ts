import { Types } from "mongoose";

export type TChatbotHistory = {
  userId: Types.ObjectId;
  userQuestion: string;
  aiAnswer: string;
};

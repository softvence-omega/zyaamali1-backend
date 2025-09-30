import { Types } from "mongoose";

export type TChatbotHistory = {
  userId?: Types.ObjectId;
  sessionId: string,
  userQuestion: string;
  aiAnswer: string;

};

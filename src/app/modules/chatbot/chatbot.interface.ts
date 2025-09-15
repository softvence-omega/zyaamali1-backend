import { Types } from "mongoose";

export type TChatbotHistory = {
  sessionId: Types.ObjectId;
  userId: Types.ObjectId;
  userQuestion: string;
  aiAnswer: string;

};

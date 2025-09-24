import { Types } from "mongoose";

export type TChatbotHistory = {
  sessionId: Types.ObjectId;
  userQuestion: string;
  aiAnswer: string;

};

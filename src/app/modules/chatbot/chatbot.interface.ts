import { Types } from "mongoose";

export type TChatbotHistory = {
  sessionId: string,
  userQuestion: string;
  aiAnswer: string;

};

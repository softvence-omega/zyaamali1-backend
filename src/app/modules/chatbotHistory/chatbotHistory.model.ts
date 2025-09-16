import mongoose, { Schema, model } from "mongoose";
import { TChatbotHistory } from "./chatbotHistory.interface";
import { string } from "zod";

const chatbotHistorySchema = new Schema<TChatbotHistory>(
  {
    sessionId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const chatbotHistoryModel = model<TChatbotHistory>(
  "chatbotHistory",
  chatbotHistorySchema
);

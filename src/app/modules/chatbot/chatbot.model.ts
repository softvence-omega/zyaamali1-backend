import mongoose, { Schema, model } from "mongoose";
import { TChatbotHistory } from "./chatbot.interface";

const chatbotHistorySchema = new Schema<TChatbotHistory>(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "chatbotHistory",
      required: true,
    },
   
    userQuestion: {
      type: String,
      required: true,
      trim: true,
    },
    aiAnswer: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const chatbotModel = model<TChatbotHistory>(
  "chatbot",
  chatbotHistorySchema
);

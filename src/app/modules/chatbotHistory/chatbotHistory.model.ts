import mongoose, { Schema, model } from "mongoose";
import { TChatbotHistory } from "./chatbotHistory.interface";

const chatbotHistorySchema = new Schema<TChatbotHistory>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

export const chatbotHistoryModel = model<TChatbotHistory>(
  "chatbotHistory",
  chatbotHistorySchema
);

import mongoose, { Schema, model } from "mongoose";
import { TChatbotHistory } from "./chatbotHistory.interface";
import { string } from "zod";

// Function to generate a random session ID (you can adjust the length or algorithm as needed)
const generateRandomSessionId = () =>
  Math.floor(Math.random() * 1000000000).toString();

const chatbotHistorySchema = new Schema<TChatbotHistory>(
  {
    sessionId: {
      type: String,
      required: true,
      default: generateRandomSessionId,
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

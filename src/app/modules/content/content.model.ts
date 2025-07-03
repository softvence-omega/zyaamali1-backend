import { Schema, model } from "mongoose";

const contentSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
    platform: {
      type: String,
      enum: ["facebook", "google", "amazon", "linkedin"], // now single value
      required: true,
    },
    ratio: {
      type: String,
      enum: ["1:1", "16:9", "9:16"],
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      enum: ["premade", "user"],
      default: "premade",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    prompt: {
      type: String,
    },
    title: {
      type: String,
    },
  },
  { timestamps: true }
);

export const ContentModel = model("Content", contentSchema);

import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  objective: { type: String, required: true }, // e.g., traffic, conversions
  platform: { type: String, enum: ["google", "meta", "tiktok", "youtube"], required: true },
  budget: { type: Number, required: true },
  status: { type: String, enum: ["active", "paused"], default: "paused" },
  startDate: Date,
  endDate: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export const Campaign = mongoose.model("Campaign", campaignSchema);


const adSetSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
  name: { type: String, required: true },
  audience: { type: Object }, // age, location, interests, etc.
  schedule: {
    start: Date,
    end: Date
  },
  budget: Number,
  platform: { type: String, enum: ["google", "meta", "tiktok", "youtube"], required: true },
}, { timestamps: true });

export const AdSet = mongoose.model("AdSet", adSetSchema);



const adSchema = new mongoose.Schema({
  adSetId: { type: mongoose.Schema.Types.ObjectId, ref: "AdSet", required: true },
  title: String,
  description: String,
  mediaUrl: String,
  callToAction: String,
  destinationUrl: String,
  platform: { type: String, enum: ["google", "meta", "tiktok", "youtube"], required: true },
  status: { type: String, enum: ["active", "paused"], default: "paused" },
}, { timestamps: true });

export const Ad = mongoose.model("Ad", adSchema);

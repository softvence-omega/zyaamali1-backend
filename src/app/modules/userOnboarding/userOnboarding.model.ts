import mongoose, { Schema, Document, model } from "mongoose";

export interface IOnboardingData extends Document {
  userId: mongoose.Types.ObjectId;
  brandName: string;
  marketingGoals: string[];
  businessInfo: {
    method: "website" | "other";
    websiteUrl: string;
    businessName: string;
    industry: string;
    businessSize: string;
    description: string;
    buniessGoal: string;
  };
}

const BusinessInfoSchema = new Schema(
  {
    method: {
      type: String,
      enum: ["website", "other"],
      required: true,
    },
    websiteUrl: { type: String, required: true },
    businessName: { type: String, required: true },
    industry: { type: String, required: true },
    businessSize: { type: String, required: true },
    description: { type: String, required: true },

    buniessGoal: { type: String, required: true },
  },
  { _id: false }
);

const OnboardingDataSchema = new Schema<IOnboardingData>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    brandName: { type: String, required: true },
    marketingGoals: [{ type: String }],
    businessInfo: { type: BusinessInfoSchema, required: true },
  },
  {
    timestamps: true,
  }
);

export const OnboardingDataModel = model<IOnboardingData>(
  "OnboardingData",
  OnboardingDataSchema
);

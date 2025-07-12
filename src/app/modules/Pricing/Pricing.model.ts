import mongoose, { Schema } from "mongoose";

const FeatureSchema = new Schema({
  videoAds: Schema.Types.Mixed,
  videoAdRevisions: Schema.Types.Mixed,
  videoQuality: { type: String, enum: ['standard', 'hd'], default: 'standard' },
  imageAds: Schema.Types.Mixed,
  imageAdRevisions: Schema.Types.Mixed,
  aiPrompts: Schema.Types.Mixed,
  teamMembers: Schema.Types.Mixed,
  platforms: { type: [String], default: [] },
  analytics: { type: String, enum: ['none', '7-day', '30-day', 'custom'], default: 'none' },
  templatesAccess: { type: Boolean, default: false },
  adScheduling: { type: String, enum: ['none', 'basic', 'bulk+smart'], default: 'none' },
  extras: { type: [String], default: [] },
}, { _id: false });


const PricingPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  usedCase: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0, // USD or BDT
  },
  
  stripePriceId: {
    type: String,
    unique: true,
    sparse: true,
    required: false,
  },

  billingInterval: {
    type: String,
    enum: ["month", "year", "day"], // Added "day" for daily billing
    default: "month", // Default to monthly if not specified
  },

  features: { type: FeatureSchema, required: true },

  isDeleted: {
    type: Boolean,
    default: false,
  },

}, { timestamps: true });

export const PricingModel = mongoose.model("PricingPlan", PricingPlanSchema);


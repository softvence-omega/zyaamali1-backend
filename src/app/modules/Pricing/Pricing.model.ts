import mongoose from "mongoose";

const FeaturePricingSchema = new mongoose.Schema({
  aiTextGeneration: {
    perWordCredits: { type: Number, require: true }
  },
  imageGeneration: {
    perImageCredits: { type: Number, required: true },
  },
  videoGeneration: {
    perVideoCredits: { type: Number, required: true },
  },
  adTargetingSuggestion: {
    perTargetingCredits: { type: Number, required: true }, // like AI targeting
  },
  facebookAdSpend: {
    creditPerDollar: { type: Number, required: true }, // e.g., 1 USD = 10 credits
  },
  googleAdSpend: {
    creditPerDollar: { type: Number, required: true },
  },
  tiktokAdSpend: {
    creditPerDollar: { type: Number, required: true },
  },
  linkedInAdSpend: {
    creditPerDollar: { type: Number, required: true },
  },
  instagramAdSpend: {
    creditPerDollar: { type: Number, required: true },
  },




}, { _id: false });

const PricingPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  usedCase: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0, // USD or BDT
  },
  totalCredits: {
    type: Number,
    required: true,
    min: 0,
  },
  stripePriceId: {
    type: String,
    unique: true, 
    sparse: true, 
  },

  billingInterval: {
    type: String,
    enum: ["month", "year"],
    default: "month", // Default to monthly if not specified
  },


  // features: {
  //   maxBusinesses: { type: Number, default: 1 },
  //   maxTeamMembers: { type: Number, default: 2 },
  //   maxCampaignsPerMonth: { type: Number, default: 10 },
  //   accessToReports: { type: Boolean, default: true },
  //   contentLibraryAccess: { type: Boolean, default: true },
  //   aiEnabled: { type: Boolean, default: true },
  // },

  featureCosts: {
    type: FeaturePricingSchema,
    required: true,
  },

  isDeleted: {
    type: Boolean,
    default: false,
  },
  
}, { timestamps: true });

export const PricingModel = mongoose.model("PricingPlan", PricingPlanSchema);


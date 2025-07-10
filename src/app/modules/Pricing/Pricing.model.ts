import mongoose from "mongoose";

const FeatureCreditSchema = new mongoose.Schema({
  aiImage: { type: Number, default: 0 },
  aiVideo: { type: Number, default: 0 },
  aiText: { type: Number, default: 0 },
  publishFacebook: {
    credit: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true }
  },
  publishInstagram: {
    credit: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true }
  },
  publishYouTube: {
    credit: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true}
  },
  publishLinkedIn: {
    credit: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true }
  },
  publishTikTok: {
    credit: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true }
  },
  publishGoogle: {
    credit: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true }
  },
  publishTwitter: {
    credit: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true }
  },
  publishSnapchat: {
    credit: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true }
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
    enum: ["month", "year", "day"], // Added "day" for daily billing
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
    type: FeatureCreditSchema,
    required: true,
  },

  isDeleted: {
    type: Boolean,
    default: false,
  },

}, { timestamps: true });

export const PricingModel = mongoose.model("PricingPlan", PricingPlanSchema);


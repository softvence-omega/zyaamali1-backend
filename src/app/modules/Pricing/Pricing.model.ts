import mongoose from "mongoose";

const PricingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // e.g. "Trial", "Premium - Tier 1", "Expert - Tier 2"
      trim: true,
    },
    usedCase: {
      type: String,
      required: true,
      unique: true, // e.g. "Small Teams", "Large Teams"
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    dailyCredits: {
      type: Number,
      required: true,
    },
    totalCredits: {
      type: Number,
      required: true,
    },

    Storage: {
      type: Number,
      required: true,
    },

    isDelete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const PricingModel = mongoose.model("Pricing", PricingSchema);

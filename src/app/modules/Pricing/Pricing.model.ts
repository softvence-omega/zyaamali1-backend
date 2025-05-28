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
    token: {
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

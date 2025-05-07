import mongoose from "mongoose";
import { ICart } from "./cart.interface";

const cartSchema = new mongoose.Schema<ICart>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },
    description: String,
    type: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
    file: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const cartModel = mongoose.model<ICart>("cart", cartSchema);

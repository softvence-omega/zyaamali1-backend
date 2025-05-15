import { Schema, model } from "mongoose";
import { TUser } from "./user.interface";

const userSchema = new Schema<TUser>(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      select: false,
      required: function () {
        return !this.provider; // Only require password if not a Google user
      },
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "admin"],
      default: "user",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const User = model<TUser>("User", userSchema);

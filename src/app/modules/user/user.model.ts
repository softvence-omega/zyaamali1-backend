import { Schema, model } from "mongoose";
import { TUser } from "./user.interface";
import { LANGUAGE } from "./user.constants";

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
        return !this.provider;
      },
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "admin"],
      default: "user",
    },
    token: {
      type: Number,
      default: 100,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const User = model<TUser>("User", userSchema);

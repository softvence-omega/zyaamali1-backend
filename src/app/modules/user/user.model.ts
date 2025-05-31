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
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      default: null,
    },
    verificationCodeExpiresAt: {
      type: Date,
      default: null,
    },
    lastVerificationSentAt: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "admin"],
      default: "user",
    },
    token: {
      type: Number,
      required: true,
      default: 100,
      min: 0,
    },
    theme: {
      type: String,
      enum: ["dark", "light", "system"],
      default: "system",
    },
    language: {
      type: String,
      enum: LANGUAGE,
      default: "English",
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

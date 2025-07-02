import { Schema, model } from "mongoose";
import { TUser } from "./user.interface";

const userSchema = new Schema<TUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    companyName: {
      type: String,
      required: function (this: TUser) {
        return this.role === "admin"
      },
      trim: true,
    },
    image: {
      type: String,
      default: null,
    },
    country: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
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
      enum: ["superAdmin", "admin", "creator", "viewer"],
      default: "viewer", // ✅ fixed default to a valid enum value
    },
    credit: {
      type: Number,
      required: false,
      min: 0,
      default: 0
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const User = model<TUser>("User", userSchema);

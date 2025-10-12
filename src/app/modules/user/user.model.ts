import mongoose, { Schema, model } from "mongoose";
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
        return this.role === "admin";
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
    role: {
      type: String,
      required: true,
      enum: ["superAdmin", "admin", "creator", "viewer"],
      default: "admin",
    },
    credit: {
      type: Number,

      required: false,
      min: 0,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // ✅ Fixed createdBy field
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      default: null,
    },

    teamMembers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],

    onBoardingcompleted: {
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
    versionKey: false,
  }
);

export const User = model<TUser>("User", userSchema);

import { Schema, model } from "mongoose";
import { TUser } from "./user.interface";

const userSchema = new Schema<TUser>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    select: 0,
  },
  role: {
    type: String,
    required: true,
    enum: ["lawyer", "admin", "client"],
  },
  status: {
    type: String,
    enum: ["in-progress", "blocked"],
    default: "in-progress",
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

export const User = model<TUser>("User", userSchema);

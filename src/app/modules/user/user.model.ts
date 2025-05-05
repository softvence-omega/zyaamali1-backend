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
    select: 0,
    required: [true, "Password is required"],
   
  },
  role: {
    type: String,
    required: true,
    enum: ["user", "admin"],
    default: "user"
  },

  isDeleted: {
    type: Boolean,
    default: false,
  },
},{
  timestamps: true
});

export const User = model<TUser>("User", userSchema);

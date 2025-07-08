import { Types } from "mongoose";

export interface IContent {
  _id?: Types.ObjectId;
  type: "image" | "video";
  platform: "facebook" | "google" | "amazon" | "linkedin"; // now single value
  ratio: "1:1" | "16:9" | "9:16";
  link: string;
  source?: "premade" | "user";
  owner?: Types.ObjectId;
  prompt?: string;
  title: string;
  isDeleted:boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

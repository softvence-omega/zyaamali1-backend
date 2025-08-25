import { Schema, model, Document } from "mongoose";
import { IAccoutData } from "./connectAdsAccount.interface";

export interface IAccountDocument extends IAccoutData, Document {}

const adAccountSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: false },
  },
  { _id: false } // ✅ prevents creating _id for each subdocument
);

const accountSchema = new Schema<IAccountDocument>(
  {
    name: { type: String, required: true },
    icon: { type: String, required: true },
    accessToken: { type: String },
    refreshToken: { type: String },
    adAccount: [adAccountSchema], // ✅ array of objects
  },
  { timestamps: true }
);

export const ConnectAccountModel = model<IAccountDocument>(
  "Account",
  accountSchema
);

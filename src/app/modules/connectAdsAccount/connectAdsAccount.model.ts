import { Schema, model, Document } from "mongoose";
import { IAccoutData } from "./connectAdsAccount.interface";


const accountSchema = new Schema<IAccoutData>(
  {
    name: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    accessToken: {
      type: String,
      required: false, // optional
    },
    refreshToken: {
      type: String,
      required: false,
    },
    adsAccoutId: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);


export const ConnectAccountModel = model<IAccoutData>("Account", accountSchema);

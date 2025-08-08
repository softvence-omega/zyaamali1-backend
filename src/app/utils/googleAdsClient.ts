import { GoogleAdsApi } from "google-ads-api";
import dotenv from "dotenv";
dotenv.config();

export const googleAdsClient = new GoogleAdsApi({
  client_id: process.env.GOOGLE_CLIENT_ID2!,
  client_secret: process.env.GOOGLE_CLIENT_SECRET2!,
  developer_token: process.env.GOOGLE_DEVELOPER_TOKEN2!,
});

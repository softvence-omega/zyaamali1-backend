import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  node_env: process.env.NODE_ENV,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  reset_pass_ui_link: process.env.RESET_PASS_UI_LINK,
  smtp_auth_user: process.env.SMTP_AUTH_USER,
  smtp_auth_pass: process.env.SMTP_AUTH_PASS,
  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
  stripe_secret_key: process.env.STRIPE_SECRET_KEY,

  google_client_id: process.env.GOOGLE_CLIENT_ID,
  google_client_secret: process.env.GOOGLE_CLIENT_SECRET,
  google_callback_url: process.env.GOOGLE_CALLBACK_URL,

  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  PROJECT_NAME: process.env.PROJECT_NAME,

  facebookAppId: process.env.FACEBOOK_APP_ID!,
  facebookAppSecret: process.env.FACEBOOK_APP_SECRET!,
  facebookRedirectUri: process.env.FACEBOOK_REDIRECT_URI!,

  linkdinClientId: process.env.LINKEDIN_CLIENT_ID,
  linkdinClientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  linkdinRedirectUrl: process.env.LINKEDIN_REDIRECT_URI,


  google__client_id: process.env.GOOGLE_CLIENT_ID,
  google__client_secret: process.env.GOOGLE_CLIENT_SECRET,
  google__refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  google__developer_token: process.env.GOOGLE_DEVELOPER_TOKEN,
  google__customer_id: process.env.GOOGLE_CUSTOMER_ID,

};

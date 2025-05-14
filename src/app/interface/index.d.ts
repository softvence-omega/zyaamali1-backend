import { JwtPayload } from "jsonwebtoken";

type GoogleUser = {
  name: string;
  email: string;
  accessToken: string;
  refreshToken: string;
};

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload | GoogleUser;
    }
  }
}

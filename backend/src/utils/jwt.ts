import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import { config } from "../config/config.js";
import type { Role } from "../models/User.js";

export interface AccessPayload extends JwtPayload {
  sub: string;
  role: Role;
  doctorId?: string;
}

export const signAccessToken = (payload: Omit<AccessPayload, "iat" | "exp">) =>
  jwt.sign(payload, config.JWT_ACCESS_SECRET, {
    expiresIn: config.ACCESS_TOKEN_TTL,
  } as SignOptions);

export const signRefreshToken = (userId: string) =>
  jwt.sign({ sub: userId, type: "refresh" }, config.JWT_REFRESH_SECRET, {
    expiresIn: `${config.REFRESH_TOKEN_TTL_DAYS}d`,
  });

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, config.JWT_ACCESS_SECRET) as AccessPayload;

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, config.JWT_REFRESH_SECRET) as JwtPayload & {
    sub: string;
    type: string;
  };

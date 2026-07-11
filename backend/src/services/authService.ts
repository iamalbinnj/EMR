import { createHash } from "node:crypto";
import { config } from "../config/config.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

const hash = (token: string) =>
  createHash("sha256").update(token).digest("hex");

const tokensFor = async (user: any) => {
  const accessToken = signAccessToken({
    sub: user.id,
    role: user.role,
    ...(user.doctorId ? { doctorId: String(user.doctorId) } : {}),
  });
  const refreshToken = signRefreshToken(user.id);
  await RefreshToken.create({
    userId: user.id,
    tokenHash: hash(refreshToken),
    expiresAt: new Date(Date.now() + config.REFRESH_TOKEN_TTL_DAYS * 86400000),
  });
  return { accessToken, refreshToken };
};

export const login = async (email: string, password: string) => {
  const user: any = await User.findOne({
    email: email.toLowerCase(),
    isActive: true,
  }).select("+passwordHash");
  if (!user || !(await user.verifyPassword(password)))
    throw new ApiError(401, "Invalid email or password");
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      doctorId: user.doctorId,
    },
    ...(await tokensFor(user)),
  };
};

export const refresh = async (token: string) => {
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
  if (payload.type !== "refresh")
    throw new ApiError(401, "Invalid refresh token");
  const stored = await RefreshToken.findOne({
    tokenHash: hash(token),
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });
  if (!stored) throw new ApiError(401, "Refresh token has been revoked");
  stored.revokedAt = new Date();
  await stored.save();
  const user = await User.findById(payload.sub);
  if (!user?.isActive) throw new ApiError(401, "User is unavailable");
  return tokensFor(user);
};

export const logout = async (token: string) => {
  await RefreshToken.updateOne(
    { tokenHash: hash(token), revokedAt: null },
    { revokedAt: new Date() },
  );
};

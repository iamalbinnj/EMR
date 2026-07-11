import type { RequestHandler } from "express";
import { ApiError } from "../utils/apiError.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const authenticate: RequestHandler = (request, _response, next) => {
  const value = request.headers.authorization;
  if (!value?.startsWith("Bearer "))
    return next(new ApiError(401, "Authentication required"));
  try {
    const payload = verifyAccessToken(value.slice(7));
    request.user = {
      id: payload.sub,
      role: payload.role,
      doctorId: payload.doctorId,
    };
    next();
  } catch {
    next(new ApiError(401, "Invalid or expired access token"));
  }
};

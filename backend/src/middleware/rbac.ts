import type { RequestHandler } from "express";

import type { Role } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";

export const requireRole =
  (...roles: Role[]): RequestHandler =>
  (request, _response, next) =>
    request.user && roles.includes(request.user.role)
      ? next()
      : next(new ApiError(403, "Insufficient permissions"));

import type { RequestHandler } from "express";
import type { ZodTypeAny } from "zod";
import { ApiError } from "../utils/apiError.js";

export const validate =
  (schema: ZodTypeAny, source: "body" | "query" = "body"): RequestHandler =>
  (request, _response, next) => {
    const result = schema.safeParse(request[source]);
    if (!result.success)
      return next(
        new ApiError(422, "Validation failed", result.error.flatten()),
      );
    request[source] = result.data;
    next();
  };

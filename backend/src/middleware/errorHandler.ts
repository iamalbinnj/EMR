import type { ErrorRequestHandler, RequestHandler } from "express";
import { randomUUID } from "node:crypto";
import { ApiError } from "../utils/apiError.js";
import { logger } from "../utils/logger.js";

export const requestContext: RequestHandler = (request, response, next) => {
  request.requestId = request.header("x-request-id") ?? randomUUID();
  response.setHeader("x-request-id", request.requestId);
  next();
};
export const notFound: RequestHandler = (_request, _response, next) =>
  next(new ApiError(404, "Route not found"));
export const errorHandler: ErrorRequestHandler = (
  error,
  request,
  response,
  _next,
) => {
  const known = error instanceof ApiError;
  if (!known)
    logger.error(
      { err: error, requestId: request.requestId },
      "Unhandled request error",
    );
  response
    .status(known ? error.statusCode : 500)
    .json({
      success: false,
      message: known ? error.message : "Internal server error",
      ...(known && error.errors ? { errors: error.errors } : {}),
      meta: { requestId: request.requestId },
    });
};

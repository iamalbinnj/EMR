import type { Response } from "express";

export const sendSuccess = (
  response: Response,
  statusCode: number,
  message: string,
  data: unknown = null,
  meta: Record<string, unknown> = {},
) => response.status(statusCode).json({ success: true, message, data, meta });

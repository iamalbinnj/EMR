import pino from "pino";
import { config } from "../config/config.js";

export const logger = pino({
  level: config.NODE_ENV === "production" ? "info" : "debug",
});

import mongoose from "mongoose";
import { config } from "./config.js";
import { logger } from "../utils/logger.js";

export const connectDatabase = async () => {
  const connection = await mongoose.connect(config.MONGODB_URI, {
    autoIndex: config.NODE_ENV !== "production",
  });
  logger.info(
    { host: connection.connection.host, database: connection.connection.name },
    "DB connected",
  );
};

export const disconnectDatabase = () => mongoose.disconnect();

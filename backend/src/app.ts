import cors from "cors";
import express from "express";
import helmet from "helmet";
import {
  errorHandler,
  notFound,
  requestContext,
} from "./middleware/errorHandler.js";
import apiRoutes from "./routes/index.js";

export const createApp = () => {
  const app = express();

  app.use(helmet());

  app.use(
    cors({ origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173" }),
  );

  app.use(express.json());
  app.use(requestContext);

  app.get("/api/v1/health", (_request, response) => {
    response.status(200).json({
      success: true,
      message: "API is healthy",
      data: { service: "emr-appointment-api" },
      meta: {},
    });
  });
  
  app.use("/api/v1", apiRoutes);
  app.use(notFound);
  app.use(errorHandler);

  return app;
};

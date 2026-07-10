import cors from "cors";
import express from "express";
import helmet from "helmet";

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173" }));
  app.use(express.json());

  app.get("/api/v1/health", (_request, response) => {
    response.status(200).json({
      success: true,
      message: "API is healthy",
      data: { service: "emr-appointment-api" },
      meta: {},
    });
  });

  return app;
};


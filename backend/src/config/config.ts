import { z } from "zod";

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(4000),

  MONGODB_URI: z
    .string()
    .min(1)
    .default("mongodb://127.0.0.1:27017/emr_appointments"),

  FRONTEND_ORIGIN: z.string().default("http://localhost:5173"),

  JWT_ACCESS_SECRET: z
    .string()
    .min(16)
    .default("development-access-secret-change-me"),

  JWT_REFRESH_SECRET: z
    .string()
    .min(16)
    .default("development-refresh-secret-change-me"),

  ACCESS_TOKEN_TTL: z.string().default("15m"),
  
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),
});

export const config = schema.parse(process.env);

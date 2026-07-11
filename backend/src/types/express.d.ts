import type { Role } from "../models/User.js";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: Role; doctorId?: string };
      requestId?: string;
    }
  }
}

export {};

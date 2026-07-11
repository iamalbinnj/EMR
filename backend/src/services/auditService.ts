import { AuditLog } from "../models/AuditLog.js";
import type { Role } from "../models/User.js";

export const logAudit = (input: {
  userId: string;
  role: Role;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: unknown;
  ipAddress?: string;
}) => AuditLog.create(input).catch(() => undefined);

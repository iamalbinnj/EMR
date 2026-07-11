import { Schema, model } from "mongoose";
import { ROLES } from "./User.js";

const schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    role: { type: String, enum: ROLES },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId },
    metadata: { type: Schema.Types.Mixed, default: {} },
    ipAddress: String,
  },
  { timestamps: true },
);

schema.index({ entity: 1, entityId: 1, createdAt: -1 });

export const AuditLog = model("AuditLog", schema);

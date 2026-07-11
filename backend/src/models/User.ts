import bcrypt from "bcryptjs";
import { Schema, model } from "mongoose";

export const ROLES = ["SUPER_ADMIN", "RECEPTIONIST", "DOCTOR"] as const;
export type Role = (typeof ROLES)[number];

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

userSchema.methods.verifyPassword = function (password: string) {
  return bcrypt.compare(password, this.passwordHash as string);
};

export const hashPassword = (password: string) => bcrypt.hash(password, 12);

export const User = model("User", userSchema);

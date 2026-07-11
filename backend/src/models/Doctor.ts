import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
      index: true,
    },
    specialization: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Doctor = model("Doctor", schema);

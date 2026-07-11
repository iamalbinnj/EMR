import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Department = model("Department", schema);

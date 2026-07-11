import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    patientCode: { type: String, required: true, unique: true },
    name: { type: String, required: true, index: true },
    mobile: { type: String, required: true, index: true },
    gender: { type: String, enum: ["MALE", "FEMALE", "OTHER"] },
    dob: Date,
    address: String,
  },
  { timestamps: true },
);

schema.index({ name: "text" });

export const Patient = model("Patient", schema);

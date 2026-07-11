import { Schema, model } from "mongoose";

export const APPOINTMENT_STATUSES = [
  "SCHEDULED",
  "ARRIVED",
  "COMPLETED",
  "CANCELLED",
] as const;

const schema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    date: { type: String, required: true },
    slotStartTime: { type: String, required: true },
    slotEndTime: { type: String, required: true },
    status: { type: String, enum: APPOINTMENT_STATUSES, default: "SCHEDULED" },
    purpose: String,
    notes: String,
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    bookingKey: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

schema.index({ doctorId: 1, date: 1, status: 1 });
schema.index({ patientId: 1, date: -1 });
schema.index({ date: 1, departmentId: 1, status: 1 });

export const Appointment = model("Appointment", schema);

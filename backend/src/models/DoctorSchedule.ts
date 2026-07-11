import { Schema, model } from "mongoose";

export const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

const interval = new Schema(
  {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false },
);

const session = new Schema(
  {
    name: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    slotDurationMinutes: { type: Number, required: true, min: 5 },
  },
  { _id: false },
);

const schema = new Schema(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true,
    },
    workingDays: [{ type: String, enum: DAYS }],
    sessions: [session],
    breaks: [{ ...interval.obj, label: String }],
    effectiveFrom: { type: Date, required: true },
    effectiveTo: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

schema.index({ doctorId: 1, effectiveFrom: -1 });

export const DoctorSchedule = model("DoctorSchedule", schema);

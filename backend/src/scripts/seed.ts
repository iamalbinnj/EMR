import "dotenv/config";
import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { Department } from "../models/Department.js";
import { Doctor } from "../models/Doctor.js";
import { DoctorSchedule } from "../models/DoctorSchedule.js";
import { hashPassword, User } from "../models/User.js";

await connectDatabase();

const department = await Department.findOneAndUpdate(
  { name: "General Medicine" },
  {
    name: "General Medicine",
    description: "Primary and internal medicine",
    isActive: true,
  },
  { upsert: true, new: true },
);

await User.findOneAndUpdate(
  { email: "admin@emr.local" },
  {
    name: "System Admin",
    email: "admin@emr.local",
    passwordHash: await hashPassword("Admin123!"),
    role: "SUPER_ADMIN",
    isActive: true,
  },
  { upsert: true, new: true },
);

const doctorUser = await User.findOneAndUpdate(
  { email: "doctor@emr.local" },
  {
    name: "Dr. Maya Rao",
    email: "doctor@emr.local",
    passwordHash: await hashPassword("Doctor123!"),
    role: "DOCTOR",
    isActive: true,
  },
  { upsert: true, new: true },
);

await User.findOneAndUpdate(
  { email: "reception@emr.local" },
  {
    name: "Front Desk",
    email: "reception@emr.local",
    passwordHash: await hashPassword("Reception123!"),
    role: "RECEPTIONIST",
    isActive: true,
  },
  { upsert: true },
);

const doctor = await Doctor.findOneAndUpdate(
  { userId: doctorUser._id },
  {
    userId: doctorUser._id,
    name: doctorUser.name,
    departmentId: department._id,
    specialization: "Internal Medicine",
    isActive: true,
  },
  { upsert: true, new: true },
);

doctorUser.doctorId = doctor._id;
await doctorUser.save();

await DoctorSchedule.findOneAndUpdate(
  { doctorId: doctor._id, isActive: true },
  {
    doctorId: doctor._id,
    workingDays: ["MON", "TUE", "WED", "THU", "FRI"],
    sessions: [
      {
        name: "Morning",
        startTime: "09:00",
        endTime: "12:00",
        slotDurationMinutes: 15,
      },
      {
        name: "Evening",
        startTime: "13:00",
        endTime: "17:00",
        slotDurationMinutes: 15,
      },
    ],
    breaks: [{ startTime: "12:00", endTime: "13:00", label: "Lunch" }],
    effectiveFrom: new Date("2026-01-01"),
    isActive: true,
  },
  { upsert: true },
);

// console.log("Seed complete: admin@emr.local / Admin123!");

await disconnectDatabase();

import "dotenv/config";
import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { Appointment } from "../models/Appointment.js";
import { Department } from "../models/Department.js";
import { Doctor } from "../models/Doctor.js";
import { Patient } from "../models/Patient.js";
import { User } from "../models/User.js";

await connectDatabase();
await Appointment.syncIndexes();

const [doctor, department, patient, user] = await Promise.all([
  Doctor.findOne(),
  Department.findOne(),
  Patient.findOne(),
  User.findOne(),
]);
if (!doctor || !department || !patient || !user)
  throw new Error("Seed a doctor, department, patient, and user first");
const date = "2099-01-01",
  start = "09:00",
  bookingKey = `${doctor.id}_${date}_${start}`;
await Appointment.deleteMany({ bookingKey });
const attempts = await Promise.allSettled(
  Array.from({ length: 20 }, () =>
    Appointment.create({
      patientId: patient.id,
      doctorId: doctor.id,
      departmentId: department.id,
      date,
      slotStartTime: start,
      slotEndTime: "09:15",
      createdBy: user.id,
      bookingKey,
    }),
  ),
);
const successes = attempts.filter((x) => x.status === "fulfilled").length;
console.log({
  attempts: attempts.length,
  successes,
  rejected: attempts.length - successes,
});
if (successes !== 1)
  throw new Error(`Expected exactly one success, received ${successes}`);
await disconnectDatabase();

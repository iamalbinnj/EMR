import mongoose from "mongoose";
import { Appointment } from "../models/Appointment.js";
import { Doctor } from "../models/Doctor.js";
import { Patient } from "../models/Patient.js";
import { ApiError } from "../utils/apiError.js";
import { emitAppointment } from "../sockets/appointmentGateway.js";
import { activeSchedule } from "./scheduleService.js";
import { generateSlots } from "./slotService.js";

const patientCode = () =>
  `PAT-${Date.now()}-${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")}`;

export interface BookingInput {
  patientId?: string;
  patient?: {
    name: string;
    mobile: string;
    gender?: string;
    dob?: string;
    address?: string;
  };
  doctorId: string;
  date: string;
  slotStartTime: string;
  purpose?: string;
  notes?: string;
}

export const createAppointment = async (
  input: BookingInput,
  userId: string,
) => {
  const doctor = await Doctor.findById(input.doctorId).lean();
  if (!doctor?.isActive) throw new ApiError(404, "Doctor not found");
  const schedule = await activeSchedule(input.doctorId, input.date);
  if (!schedule)
    throw new ApiError(422, "Doctor has no active schedule for this date");
  const existing = await Appointment.find({
    doctorId: input.doctorId,
    date: input.date,
    status: { $ne: "CANCELLED" },
  })
    .select("slotStartTime")
    .lean();
  const slots = generateSlots(
    schedule as any,
    input.date,
    new Set(existing.map((x) => x.slotStartTime)),
  );
  const slot = slots.find((x) => x.startTime === input.slotStartTime);
  if (!slot)
    throw new ApiError(
      422,
      "The selected time is outside the doctor's available schedule",
    );
  if (!slot.available) throw new ApiError(409, "Slot already booked");

  const session =
    input.patient && !input.patientId
      ? await mongoose.startSession()
      : undefined;
  try {
    let created: any;
    const work = async () => {
      let id = input.patientId;
      if (!id && input.patient) {
        const [patient] = await Patient.create(
          [{ ...input.patient, patientCode: patientCode() }],
          session ? { session } : undefined,
        );
        id = patient!.id;
      }
      if (!id)
        throw new ApiError(
          422,
          "Either patientId or new patient details are required",
        );
      [created] = await Appointment.create(
        [
          {
            patientId: id,
            doctorId: input.doctorId,
            departmentId: doctor.departmentId,
            date: input.date,
            slotStartTime: slot.startTime,
            slotEndTime: slot.endTime,
            purpose: input.purpose,
            notes: input.notes,
            createdBy: userId,
            bookingKey: `${input.doctorId}_${input.date}_${slot.startTime}`,
          },
        ],
        session ? { session } : undefined,
      );
    };
    if (session) await session.withTransaction(work);
    else await work();
    emitAppointment(input.doctorId, input.date, "appointment:created", created);
    return created;
  } catch (error: any) {
    if (error?.code === 11000) throw new ApiError(409, "Slot already booked");
    throw error;
  } finally {
    await session?.endSession();
  }
};

export const listAppointments = async (
  query: Record<string, any>,
  user: Express.Request["user"],
) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const filter: Record<string, any> = {};
  if (user?.role === "DOCTOR") filter.doctorId = user.doctorId;
  else if (query.doctorId) filter.doctorId = query.doctorId;
  if (query.departmentId) filter.departmentId = query.departmentId;
  if (query.status) filter.status = query.status;
  if (query.dateFrom || query.dateTo)
    filter.date = {
      ...(query.dateFrom ? { $gte: query.dateFrom } : {}),
      ...(query.dateTo ? { $lte: query.dateTo } : {}),
    };
  if (query.search) {
    const patients = await Patient.find({
      $or: [
        { name: new RegExp(query.search, "i") },
        { mobile: new RegExp(query.search, "i") },
        { patientCode: new RegExp(query.search, "i") },
      ],
    })
      .select("_id")
      .limit(200)
      .lean();
    filter.patientId = { $in: patients.map((p) => p._id) };
  }

  
  const allowedSort = new Set(["date", "createdAt", "status", "slotStartTime"]);
  const sortBy = allowedSort.has(query.sortBy) ? query.sortBy : "date";
  const sort: any = {
    [sortBy]: query.order === "asc" ? 1 : -1,
    slotStartTime: 1,
  };
  const [data, total] = await Promise.all([
    Appointment.find(filter)
      .populate("patientId", "patientCode name mobile gender dob")
      .populate("doctorId", "name specialization")
      .populate("departmentId", "name")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Appointment.countDocuments(filter),
  ]);
  return {
    data,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

const transitions: Record<string, string[]> = {
  SCHEDULED: ["ARRIVED", "CANCELLED"],
  ARRIVED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};
export const updateAppointment = async (
  id: string,
  changes: any,
  userId: string,
  doctorId?: string,
) => {
  const item = await Appointment.findOne({
    _id: id,
    ...(doctorId ? { doctorId } : {}),
  });
  if (!item) throw new ApiError(404, "Appointment not found");
  if (changes.status && !transitions[item.status]?.includes(changes.status))
    throw new ApiError(
      409,
      `Cannot transition ${item.status} to ${changes.status}`,
    );
  if (changes.purpose !== undefined) item.purpose = changes.purpose;
  if (changes.notes !== undefined) item.notes = changes.notes;
  if (changes.status) item.status = changes.status;
  item.updatedBy = new mongoose.Types.ObjectId(userId);
  await item.save();
  emitAppointment(
    String(item.doctorId),
    item.date,
    item.status === "CANCELLED"
      ? "appointment:cancelled"
      : "appointment:updated",
    item,
  );
  return item;
};

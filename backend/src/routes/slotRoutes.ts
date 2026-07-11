import { Router } from "express";
import { Appointment } from "../models/Appointment.js";
import { activeSchedule } from "../services/scheduleService.js";
import { generateSlots } from "../services/slotService.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const doctorId = String(req.query.doctorId ?? "");
    const date = String(req.query.date ?? "");
    if (!doctorId || !/^\d{4}-\d{2}-\d{2}$/.test(date))
      throw new ApiError(422, "doctorId and date (YYYY-MM-DD) are required");
    const schedule = await activeSchedule(doctorId, date);
    if (!schedule) return sendSuccess(res, 200, "No active schedule", []);
    const booked = await Appointment.find({
      doctorId,
      date,
      status: { $ne: "CANCELLED" },
    })
      .select("slotStartTime")
      .lean();
    return sendSuccess(
      res,
      200,
      "Slots retrieved",
      generateSlots(
        schedule as any,
        date,
        new Set(booked.map((x) => x.slotStartTime)),
      ),
    );
  }),
);

export default router;

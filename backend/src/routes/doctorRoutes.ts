import { Router } from "express";
import { z } from "zod";
import { Doctor } from "../models/Doctor.js";
import { DoctorSchedule, DAYS } from "../models/DoctorSchedule.js";
import { requireRole } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import { assertScheduleValid } from "../services/scheduleService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) =>
    sendSuccess(
      res,
      200,
      "Doctors retrieved",
      await Doctor.find({
        isActive: true,
        ...(req.query.departmentId
          ? { departmentId: req.query.departmentId }
          : {}),
      })
        .populate("departmentId", "name")
        .lean(),
    ),
  ),
);

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const interval = z.object({ startTime: time, endTime: time });

const scheduleSchema = z.object({
  workingDays: z.array(z.enum(DAYS)).min(1),
  sessions: z
    .array(
      interval.extend({
        name: z.string().min(1),
        slotDurationMinutes: z.number().int().min(5).max(240),
      }),
    )
    .min(1),
  breaks: z
    .array(interval.extend({ label: z.string().optional() }))
    .default([]),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date().optional(),
});

router.post(
  "/:doctorId/schedules",
  requireRole("SUPER_ADMIN"),
  validate(scheduleSchema),
  asyncHandler(async (req, res) => {
    assertScheduleValid(req.body.sessions, req.body.breaks);
    const data = await DoctorSchedule.create({
      ...req.body,
      doctorId: req.params.doctorId,
    });
    sendSuccess(res, 201, "Schedule created", data);
  }),
);

export default router;

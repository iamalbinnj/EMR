import { Router } from "express";
import { z } from "zod";
import { requireRole } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import { logAudit } from "../services/auditService.js";
import {
  createAppointment,
  listAppointments,
  updateAppointment,
} from "../services/appointmentService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";

const router = Router();

const objectId = z.string().regex(/^[a-f\d]{24}$/i);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

const patient = z.object({
  name: z.string().min(2),
  mobile: z.string().min(7).max(20),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  dob: z.string().optional(),
  address: z.string().max(500).optional(),
});

const booking = z
  .object({
    patientId: objectId.optional(),
    patient: patient.optional(),
    doctorId: objectId,
    date,
    slotStartTime: time,
    purpose: z.string().max(500).optional(),
    notes: z.string().max(2000).optional(),
  })
  .refine(
    (x) => Boolean(x.patientId) !== Boolean(x.patient),
    "Provide either patientId or patient details",
  );

router.post(
  "/",
  requireRole("SUPER_ADMIN", "RECEPTIONIST"),
  validate(booking),
  asyncHandler(async (req, res) => {
    const data = await createAppointment(req.body, req.user!.id);
    void logAudit({
      userId: req.user!.id,
      role: req.user!.role,
      action: "APPOINTMENT_CREATED",
      entity: "Appointment",
      entityId: data.id,
      ipAddress: req.ip,
    });
    sendSuccess(res, 201, "Appointment created successfully", data);
  }),
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const result = await listAppointments(req.query, req.user);
    sendSuccess(res, 200, "Appointments retrieved", result.data, result.meta);
  }),
);

const edit = z
  .object({
    purpose: z.string().max(500).optional(),
    notes: z.string().max(2000).optional(),
  })
  .refine((x) => Object.keys(x).length > 0);

router.put(
  "/:id",
  requireRole("SUPER_ADMIN", "RECEPTIONIST", "DOCTOR"),
  validate(edit),
  asyncHandler(async (req, res) => {
    const data = await updateAppointment(
      String(req.params.id),
      req.body,
      req.user!.id,
      req.user!.role === "DOCTOR" ? req.user!.doctorId : undefined,
    );
    void logAudit({
      userId: req.user!.id,
      role: req.user!.role,
      action: "APPOINTMENT_UPDATED",
      entity: "Appointment",
      entityId: data.id,
      ipAddress: req.ip,
    });
    sendSuccess(res, 200, "Appointment updated", data);
  }),
);

router.delete(
  "/:id",
  requireRole("SUPER_ADMIN", "RECEPTIONIST"),
  asyncHandler(async (req, res) => {
    const data = await updateAppointment(
      String(req.params.id),
      { status: "CANCELLED" },
      req.user!.id,
    );
    void logAudit({
      userId: req.user!.id,
      role: req.user!.role,
      action: "APPOINTMENT_CANCELLED",
      entity: "Appointment",
      entityId: data.id,
      ipAddress: req.ip,
    });
    sendSuccess(res, 200, "Appointment cancelled", data);
  }),
);

router.post(
  "/:id/arrive",
  requireRole("SUPER_ADMIN", "RECEPTIONIST"),
  asyncHandler(async (req, res) =>
    sendSuccess(
      res,
      200,
      "Patient marked as arrived",
      await updateAppointment(
        String(req.params.id),
        { status: "ARRIVED" },
        req.user!.id,
      ),
    ),
  ),
);

router.post(
  "/:id/complete",
  requireRole("SUPER_ADMIN", "DOCTOR"),
  asyncHandler(async (req, res) =>
    sendSuccess(
      res,
      200,
      "Appointment completed",
      await updateAppointment(
        String(req.params.id),
        { status: "COMPLETED" },
        req.user!.id,
        req.user!.role === "DOCTOR" ? req.user!.doctorId : undefined,
      ),
    ),
  ),
);

export default router;

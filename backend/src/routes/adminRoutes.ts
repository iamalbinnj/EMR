import { Router } from "express";
import { z } from "zod";
import { Department } from "../models/Department.js";
import { Doctor } from "../models/Doctor.js";
import { hashPassword, User } from "../models/User.js";
import { requireRole } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";

const router = Router();

router.use(requireRole("SUPER_ADMIN"));

router.post(
  "/departments",
  validate(
    z.object({ name: z.string().min(2), description: z.string().optional() }),
  ),
  asyncHandler(async (req, res) =>
    sendSuccess(
      res,
      201,
      "Department created",
      await Department.create(req.body),
    ),
  ),
);

router.post(
  "/users",
  validate(
    z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(8),
      role: z.enum(["RECEPTIONIST", "DOCTOR"]),
      departmentId: z
        .string()
        .regex(/^[a-f\d]{24}$/i)
        .optional(),
      specialization: z.string().optional(),
    }),
  ),
  asyncHandler(async (req, res) => {
    const { password, departmentId, specialization, ...input } = req.body;
    const user = await User.create({
      ...input,
      passwordHash: await hashPassword(password),
    });
    if (input.role === "DOCTOR") {
      if (!departmentId)
        throw new Error("departmentId is required for a doctor");
      const doctor = await Doctor.create({
        userId: user.id,
        name: user.name,
        departmentId,
        specialization,
      });
      user.doctorId = doctor._id;
      await user.save();
    }
    sendSuccess(res, 201, "User created", {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      doctorId: user.doctorId,
    });
  }),
);

export default router;

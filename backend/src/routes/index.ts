import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import adminRoutes from "./adminRoutes.js";
import appointmentRoutes from "./appointmentRoutes.js";
import authRoutes from "./authRoutes.js";
import doctorRoutes from "./doctorRoutes.js";
import patientRoutes from "./patientRoutes.js";
import slotRoutes from "./slotRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use(authenticate);
router.use("/admin", adminRoutes);
router.use("/doctors", doctorRoutes);
router.use("/slots", slotRoutes);
router.use("/patients", patientRoutes);
router.use("/appointments", appointmentRoutes);

export default router;

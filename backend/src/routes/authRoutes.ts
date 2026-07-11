import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import * as auth from "../services/authService.js";
import { logAudit } from "../services/auditService.js";

const router = Router();

router.post(
  "/login",
  validate(
    z.object({ email: z.string().email(), password: z.string().min(8) }),
  ),
  asyncHandler(async (req, res) => {
    const data = await auth.login(req.body.email, req.body.password);
    void logAudit({
      userId: data.user.id,
      role: data.user.role,
      action: "LOGIN",
      entity: "User",
      entityId: data.user.id,
      ipAddress: req.ip,
    });
    sendSuccess(res, 200, "Login successful", data);
  }),
);

router.post(
  "/refresh",
  validate(z.object({ refreshToken: z.string().min(1) })),
  asyncHandler(async (req, res) =>
    sendSuccess(
      res,
      200,
      "Token refreshed",
      await auth.refresh(req.body.refreshToken),
    ),
  ),
);

router.post(
  "/logout",
  authenticate,
  validate(z.object({ refreshToken: z.string().min(1) })),
  asyncHandler(async (req, res) => {
    await auth.logout(req.body.refreshToken);
    void logAudit({
      userId: req.user!.id,
      role: req.user!.role,
      action: "LOGOUT",
      entity: "User",
      entityId: req.user!.id,
      ipAddress: req.ip,
    });
    sendSuccess(res, 200, "Logout successful");
  }),
);

export default router;

import { Router } from "express";
import { Patient } from "../models/Patient.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";

const router = Router();

router.get(
  "/search",
  asyncHandler(async (req, res) => {
    const query = String(req.query.query ?? "").trim();
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const data = query
      ? await Patient.find({
          $or: [
            { patientCode: new RegExp(escaped, "i") },
            { mobile: new RegExp(escaped, "i") },
            { name: new RegExp(escaped, "i") },
          ],
        })
          .limit(20)
          .lean()
      : [];
    sendSuccess(res, 200, "Patients retrieved", data);
  }),
);

export default router;

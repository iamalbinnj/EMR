import { DoctorSchedule } from "../models/DoctorSchedule.js";
import { ApiError } from "../utils/apiError.js";

const mins = (v: string) => Number(v.slice(0, 2)) * 60 + Number(v.slice(3));

export const assertScheduleValid = (
  sessions: Array<{ startTime: string; endTime: string }>,
  breaks: Array<{ startTime: string; endTime: string }>,
) => {
  const all = [...sessions].sort(
    (a, b) => mins(a.startTime) - mins(b.startTime),
  );
  if (
    all.some((x) => mins(x.startTime) >= mins(x.endTime)) ||
    all.some((x, i) => i > 0 && mins(x.startTime) < mins(all[i - 1]!.endTime))
  )
    throw new ApiError(422, "Sessions must be valid and non-overlapping");
  if (breaks.some((x) => mins(x.startTime) >= mins(x.endTime)))
    throw new ApiError(422, "Break times are invalid");
};

export const activeSchedule = (doctorId: string, date: string) =>
  DoctorSchedule.findOne({
    doctorId,
    isActive: true,
    effectiveFrom: { $lte: new Date(`${date}T23:59:59.999Z`) },
    $or: [
      { effectiveTo: null },
      { effectiveTo: { $gte: new Date(`${date}T00:00:00.000Z`) } },
    ],
  })
    .sort({ effectiveFrom: -1 })
    .lean();

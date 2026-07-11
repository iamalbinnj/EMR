import { describe, expect, it } from "vitest";
import { generateSlots } from "./slotService.js";
const schedule: any = {
  workingDays: ["MON"],
  sessions: [
    {
      name: "Morning",
      startTime: "09:00",
      endTime: "10:00",
      slotDurationMinutes: 15,
    },
  ],
  breaks: [{ startTime: "09:30", endTime: "09:45" }],
};
describe("generateSlots", () => {
  it("generates non-overlapping slots, removes breaks, and marks bookings", () => {
    const slots = generateSlots(
      schedule,
      "2026-07-13",
      new Set(["09:15"]),
      new Date("2026-07-12T08:00:00"),
    );
    expect(slots).toEqual([
      { startTime: "09:00", endTime: "09:15", available: true },
      { startTime: "09:15", endTime: "09:30", available: false },
      { startTime: "09:45", endTime: "10:00", available: true },
    ]);
  });
  it("returns no slots for past dates", () =>
    expect(
      generateSlots(
        schedule,
        "2026-07-06",
        new Set(),
        new Date("2026-07-12T08:00:00"),
      ),
    ).toEqual([]));
});

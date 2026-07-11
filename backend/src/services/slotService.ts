export interface Slot {
  startTime: string;
  endTime: string;
  available: boolean;
}

const minutes = (value: string) => {
  const [h = 0, m = 0] = value.split(":").map(Number);
  return h * 60 + m;
};

const clock = (value: number) =>
  `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;

export const generateSlots = (
  schedule: {
    workingDays: string[];
    sessions: Array<{
      startTime: string;
      endTime: string;
      slotDurationMinutes: number;
    }>;
    breaks: Array<{ startTime: string; endTime: string }>;
  },
  date: string,
  booked: ReadonlySet<string>,
  now = new Date(),
): Slot[] => {
  const target = new Date(`${date}T00:00:00`);
  const day = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][
    target.getDay()
  ];
  if (!day || !schedule.workingDays.includes(day as any)) return [];
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (target < today) return [];
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return schedule.sessions.flatMap((session) => {
    const result: Slot[] = [];
    for (
      let start = minutes(session.startTime);
      start + session.slotDurationMinutes <= minutes(session.endTime);
      start += session.slotDurationMinutes
    ) {
      const end = start + session.slotDurationMinutes;
      const overlapsBreak = schedule.breaks.some(
        (item) =>
          start < minutes(item.endTime) && end > minutes(item.startTime),
      );
      const startTime = clock(start);
      if (
        !overlapsBreak &&
        !(target.getTime() === today.getTime() && start < nowMinutes)
      )
        result.push({
          startTime,
          endTime: clock(end),
          available: !booked.has(startTime),
        });
    }
    return result;
  });
};

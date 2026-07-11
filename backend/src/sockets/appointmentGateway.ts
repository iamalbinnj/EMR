import type { Server } from "socket.io";

let io: Server | undefined;

export const setSocketServer = (server: Server) => {
  io = server;
};

export const scheduleRoom = (doctorId: string, date: string) =>
  `schedule:${doctorId}:${date}`;

export const emitAppointment = (
  doctorId: string,
  date: string,
  event: string,
  payload: unknown,
) => io?.to(scheduleRoom(doctorId, date)).emit(event, payload);

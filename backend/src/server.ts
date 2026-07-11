import "dotenv/config";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { config } from "./config/config.js";
import { connectDatabase } from "./config/database.js";
import { scheduleRoom, setSocketServer } from "./sockets/appointmentGateway.js";
import { verifyAccessToken } from "./utils/jwt.js";
import { logger } from "./utils/logger.js";

const httpServer = createServer(createApp());

const io = new Server(httpServer, {
  cors: { origin: config.FRONTEND_ORIGIN },
});

io.use((socket, next) => {
  try {
    verifyAccessToken(String(socket.handshake.auth.token ?? ""));
    next();
  } catch {
    next(new Error("Authentication required"));
  }
});

io.on("connection", (socket) => {
  socket.on(
    "join-room",
    ({ doctorId, date }: { doctorId: string; date: string }) =>
      void socket.join(scheduleRoom(doctorId, date)),
  );
  socket.on(
    "leave-room",
    ({ doctorId, date }: { doctorId: string; date: string }) =>
      void socket.leave(scheduleRoom(doctorId, date)),
  );
});

setSocketServer(io);

await connectDatabase();
httpServer.listen(config.PORT, () =>
  logger.info({ port: config.PORT }, "API listening"),
);

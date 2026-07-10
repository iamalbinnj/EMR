import "dotenv/config";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 4000);
const httpServer = createServer(createApp());

new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173" },
});

httpServer.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});


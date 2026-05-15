import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "./env";


let io: Server | null = null;

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: env.corsOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("auction:join", (auctionId: string) => {
      socket.join(`auction:${auctionId}`);

      socket.emit("auction:joined", {
        auctionId,
        room: `auction:${auctionId}`,
      });

      console.log(`Socket ${socket.id} joined auction:${auctionId}`);
    });

    socket.on("auction:leave", (auctionId: string) => {
      socket.leave(`auction:${auctionId}`);

      socket.emit("auction:left", {
        auctionId,
        room: `auction:${auctionId}`,
      });

      console.log(`Socket ${socket.id} left auction:${auctionId}`);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
}

export function getSocketServer() {
  if (!io) {
    throw new Error("Socket.io has not been initialized");
  }

  return io;
}
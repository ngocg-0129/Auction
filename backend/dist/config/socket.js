"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = initSocket;
exports.getSocketServer = getSocketServer;
const socket_io_1 = require("socket.io");
let io = null;
function initSocket(server) {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });
    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);
        socket.on("auction:join", (auctionId) => {
            socket.join(`auction:${auctionId}`);
            socket.emit("auction:joined", {
                auctionId,
                room: `auction:${auctionId}`,
            });
            console.log(`Socket ${socket.id} joined auction:${auctionId}`);
        });
        socket.on("auction:leave", (auctionId) => {
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
function getSocketServer() {
    if (!io) {
        throw new Error("Socket.io has not been initialized");
    }
    return io;
}

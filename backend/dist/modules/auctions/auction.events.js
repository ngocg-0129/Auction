"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitAuctionEnded = emitAuctionEnded;
const socket_1 = require("../../config/socket");
function emitAuctionEnded(data) {
    const io = (0, socket_1.getSocketServer)();
    io.to(`auction:${data.auctionItemId}`).emit("auction:ended", {
        auctionItemId: data.auctionItemId,
        winningBid: data.winningBid,
        winnerId: data.winnerId,
    });
}

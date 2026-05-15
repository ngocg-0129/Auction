"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitNewBid = emitNewBid;
const socket_1 = require("../../config/socket");
function emitNewBid(data) {
    const io = (0, socket_1.getSocketServer)();
    io.to(`auction:${data.auctionItemId}`).emit("bid:new", {
        auctionItemId: data.auctionItemId,
        amount: data.amount,
        bidderId: data.bidderId,
        bidderEmail: data.bidderEmail,
        bidderName: data.bidderName,
        createdAt: data.createdAt,
    });
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auctionQueue = void 0;
exports.scheduleCloseAuctionJob = scheduleCloseAuctionJob;
const bullmq_1 = require("bullmq");
const env_1 = require("../config/env");
exports.auctionQueue = new bullmq_1.Queue("auction-queue", {
    connection: {
        host: env_1.env.redisHost,
        port: env_1.env.redisPort,
    },
});
async function scheduleCloseAuctionJob(data) {
    const delay = data.endsAt.getTime() - Date.now();
    if (delay <= 0) {
        return;
    }
    await exports.auctionQueue.add("close-auction", {
        auctionItemId: data.auctionItemId,
    }, {
        delay,
        jobId: `close-auction-${data.auctionItemId}`, // tránh tạo trùng job cho 1 auction
        removeOnComplete: true,
        removeOnFail: false,
    });
}

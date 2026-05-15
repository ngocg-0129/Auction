"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAuctionWorker = startAuctionWorker;
const bullmq_1 = require("bullmq");
const env_1 = require("../config/env");
const auction_service_1 = require("../modules/auctions/auction.service");
function startAuctionWorker() {
    const worker = new bullmq_1.Worker("auction-queue", async (job) => {
        if (job.name === "close-auction") {
            const { auctionItemId } = job.data;
            console.log("Closing auction:", auctionItemId);
            await (0, auction_service_1.closeAuctionService)(auctionItemId);
        }
    }, {
        connection: {
            host: env_1.env.redisHost,
            port: env_1.env.redisPort,
        },
    });
    worker.on("completed", (job) => {
        console.log(`Auction job completed: ${job.id}`);
    });
    worker.on("failed", (job, error) => {
        console.error(`Auction job failed: ${job?.id}`, error);
    });
    return worker;
}

import { Worker } from "bullmq";
import { env } from "../config/env";
import { closeAuctionService } from "../modules/auctions/auction.service";

export function startAuctionWorker() {
  const worker = new Worker(
    "auction-queue",
    async (job) => {
      if (job.name === "close-auction") {
        const { auctionItemId } = job.data as {
          auctionItemId: string;
        };

        console.log("Closing auction:", auctionItemId);

        await closeAuctionService(auctionItemId);
      }
    },
    {
      connection: {
        host: env.redisHost,
        port: env.redisPort,
      },
    }
  );

  worker.on("completed", (job) => {
    console.log(`Auction job completed: ${job.id}`);
  });

  worker.on("failed", (job, error) => {
    console.error(`Auction job failed: ${job?.id}`, error);
  });

  return worker;
}
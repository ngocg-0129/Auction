import { Queue } from "bullmq";
import { env } from "../config/env";

const redisConnection = env.redisUrl
  ? { url: env.redisUrl }
  : {
      host: env.redisHost,
      port: env.redisPort,
    };

export const auctionQueue = new Queue("auction-queue", {
  connection: redisConnection,
});

export async function scheduleCloseAuctionJob(data: {
  auctionItemId: string;
  endsAt: Date;
}) {
  const delay = data.endsAt.getTime() - Date.now();

  if (delay <= 0) {
    return;
  }

  await auctionQueue.add(
    "close-auction",
    {
      auctionItemId: data.auctionItemId,
    },
    {
      delay,
      jobId: `close-auction-${data.auctionItemId}`,
      removeOnComplete: true,
      removeOnFail: false,
    }
  );
}
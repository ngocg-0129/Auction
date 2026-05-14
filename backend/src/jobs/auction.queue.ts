import { Queue } from "bullmq";
import { env } from "../config/env";

export const auctionQueue = new Queue("auction-queue", {
  connection: {
    host: env.redisHost,
    port: env.redisPort,
  },
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
      jobId: `close-auction-${data.auctionItemId}`, // tránh tạo trùng job cho 1 auction
      removeOnComplete: true,
      removeOnFail: false,
    }
  );
}
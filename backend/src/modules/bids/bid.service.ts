import { AuctionStatus } from "@prisma/client";
import { prisma } from "../../config/db";
import { redis } from "../../config/redis";
import { findBidsByAuctionId } from "./bid.repository";
import { placeBidLuaScript } from "./bid.lua";
import { PlaceBidInput } from "./bid.types";
import {
  auctionHighestBidKey,
  auctionHighestBidderKey,
  auctionStatusKey,
} from "./bid.redis-keys";
import { emitNewBid } from "./bid.events";
import { createOutbidNotification } from "../notifications/notification.service";
import { bidsCounter, bidDurationHistogram } from "../../metrics";


export async function placeBidService(
  auctionItemId: string,
  userId: string,
  input: PlaceBidInput
) {
  const { amount } = input;

  const endTimer = bidDurationHistogram.startTimer({ auction_id: auctionItemId });


  if (!amount || amount <= 0) {
    throw new Error("Bid amount must be greater than 0");
  }

  const auction = await prisma.auctionItem.findUnique({
    where: {
      id: auctionItemId,
    },
  });

  if (!auction) {
    throw new Error("Auction not found");
  }

  if (auction.status !== AuctionStatus.ACTIVE) {
    throw new Error("Auction is not active");
  }

  const now = new Date();

  if (auction.endsAt <= now) {
    throw new Error("Auction has ended");
  }

  if (auction.createdById === userId) {
    throw new Error("You cannot bid on your own auction");
  }

  const auctionTitle = auction.title;

  await ensureAuctionInRedis(auctionItemId, Number(auction.currentPrice));

  const redisResult = (await redis.eval(
    placeBidLuaScript,
    3,
    auctionHighestBidKey(auctionItemId),
    auctionHighestBidderKey(auctionItemId),
    auctionStatusKey(auctionItemId),
    amount,
    userId
  )) as [number, string, string, string];

  const [success, code, _previousBidAmount, previousWinnerId] = redisResult;

  if (success !== 1) {

    bidsCounter.inc({ auction_id: auctionItemId, status: 'error' }); // ← thêm
    endTimer(); 

    if (code === "AUCTION_NOT_ACTIVE") {
      throw new Error("Auction is not active");
    }

    if (code === "AUCTION_NOT_INITIALIZED") {
      throw new Error("Auction is not initialized in Redis");
    }

    if (code === "BID_TOO_LOW") {
      throw new Error("Bid amount must be higher than current price");
    }

    throw new Error("Bid rejected");
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
    const bid = await tx.bid.create({
      data: {
        auctionItemId,
        userId,
        amount,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    const updatedAuctionCount = await tx.auctionItem.updateMany({
      where: {
        id: auctionItemId,
        status: AuctionStatus.ACTIVE,
        endsAt: {
          gt: new Date(),
        },
        currentPrice: {
          lt: amount,
        },
      },
      data: {
        currentPrice: amount,
        currentWinnerId: userId,
      },
    });

    if (updatedAuctionCount.count === 0) {
      throw new Error("Bid is no longer the highest bid");
    }

    const updatedAuction = await tx.auctionItem.findUnique({
      where: {
        id: auctionItemId,
      },
      include: {
        currentWinner: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    return {
      bid,
      auction: updatedAuction,
    };
  });

    emitNewBid({
    auctionItemId,
    amount,
    bidderId: userId,
    bidderEmail: result.bid.user.email,
    bidderName: result.bid.user.fullName,
    createdAt: result.bid.createdAt,
    });
    
    if (previousWinnerId && previousWinnerId !== userId) {
      await createOutbidNotification({
        userId: previousWinnerId,
        auctionItemId,
        auctionTitle,
        newAmount: amount,
      });
    }

    bidsCounter.inc({ auction_id: auctionItemId, status: 'success' }); // ← thêm
    endTimer(); 

    return result;
  } catch (error) {
    bidsCounter.inc({ auction_id: auctionItemId, status: 'error' }); // ← thêm
    endTimer(); 
    await rollbackRedisBidIfStillCurrent(auctionItemId, amount, userId);
    throw error;
  }
}

export async function getBidsByAuctionService(auctionItemId: string) {
  const auction = await prisma.auctionItem.findUnique({
    where: {
      id: auctionItemId,
    },
  });

  if (!auction) {
    throw new Error("Auction not found");
  }

  return findBidsByAuctionId(auctionItemId);
}

async function ensureAuctionInRedis(
  auctionItemId: string,
  currentPrice: number
) {
  const statusKey = auctionStatusKey(auctionItemId);
  const highestBidKey = auctionHighestBidKey(auctionItemId);
  const highestBidderKey = auctionHighestBidderKey(auctionItemId);

  const status = await redis.get(statusKey);
  const highestBid = await redis.get(highestBidKey);

  if (!status) {
    await redis.set(statusKey, AuctionStatus.ACTIVE);
  }

  if (!highestBid) {
    await redis.set(highestBidKey, currentPrice);
  }

  const highestBidder = await redis.get(highestBidderKey);

  if (highestBidder === null) {
    await redis.set(highestBidderKey, "");
  }
}

async function rollbackRedisBidIfStillCurrent(
  auctionItemId: string,
  failedAmount: number,
  failedUserId: string
) {
  const redisAmount = await redis.get(auctionHighestBidKey(auctionItemId));
  const redisBidder = await redis.get(auctionHighestBidderKey(auctionItemId));

  if (Number(redisAmount) !== failedAmount || redisBidder !== failedUserId) {
    return;
  }

  const highestBid = await prisma.bid.findFirst({
    where: {
      auctionItemId,
    },
    orderBy: {
      amount: "desc",
    },
  });

  const auction = await prisma.auctionItem.findUnique({
    where: {
      id: auctionItemId,
    },
  });

  if (!auction) {
    return;
  }

  if (!highestBid) {
    await redis.set(
      auctionHighestBidKey(auctionItemId),
      Number(auction.startingPrice)
    );
    await redis.set(auctionHighestBidderKey(auctionItemId), "");
    return;
  }

  await redis.set(auctionHighestBidKey(auctionItemId), Number(highestBid.amount));
  await redis.set(auctionHighestBidderKey(auctionItemId), highestBid.userId);
}
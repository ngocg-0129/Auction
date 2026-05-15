import { AuctionStatus } from "@prisma/client";
import {
  createAuction,
  findAuctionById,
  findAuctions,
  updateAuctionStatus,
} from "./auction.repository";
import { AuctionListQuery, CreateAuctionInput } from "./auction.types";
import { redis } from "../../config/redis";
import {
  auctionHighestBidKey,
  auctionHighestBidderKey,
  auctionStatusKey,
} from "../bids/bid.redis-keys";
import { prisma } from "../../config/db";
import { emitAuctionEnded } from "./auction.events";
import { scheduleCloseAuctionJob } from "../../jobs/auction.queue";
import { createAuctionWonNotification } from "../notifications/notification.service";
import { AppError } from "../../utils/app-error";

function parseAuctionStatus(status?: string): AuctionStatus | undefined {
  if (!status) return undefined;

  const normalizedStatus = status.toUpperCase();

  if (
    normalizedStatus !== AuctionStatus.SCHEDULED &&
    normalizedStatus !== AuctionStatus.ACTIVE &&
    normalizedStatus !== AuctionStatus.ENDED &&
    normalizedStatus !== AuctionStatus.CANCELLED
  ) {
    throw new Error("Invalid auction status");
  }

  return normalizedStatus as AuctionStatus;
}

export async function createAuctionService(
  input: CreateAuctionInput,
  userId: string
) {
  const { title, description, startingPrice, startsAt, endsAt } = input;

  if (!title) {
    throw new Error("Title is required");
  }

  if (!startingPrice || startingPrice <= 0) {
    throw new Error("Starting price must be greater than 0");
  }

  if (!startsAt || !endsAt) {
    throw new Error("startsAt and endsAt are required");
  }

  const startsAtDate = new Date(startsAt);
  const endsAtDate = new Date(endsAt);

  if (Number.isNaN(startsAtDate.getTime())) {
    throw new Error("startsAt is invalid");
  }

  if (Number.isNaN(endsAtDate.getTime())) {
    throw new Error("endsAt is invalid");
  }

  if (endsAtDate <= startsAtDate) {
    throw new Error("endsAt must be after startsAt");
  }

  return createAuction({
    title,
    description,
    startingPrice,
    startsAt: startsAtDate,
    endsAt: endsAtDate,
    createdById: userId,
  });
}

export async function getAuctionsService(query: AuctionListQuery) {
  const status = parseAuctionStatus(query.status);

  return findAuctions({
    status,
    search: query.search,
  });
}

export async function getAuctionDetailService(id: string) {
  const auction = await findAuctionById(id);

  if (!auction) {
    throw new AppError(404, "Auction not found");
  }

  return auction;
}

export async function startAuctionService(id: string, userId: string) {
  const auction = await findAuctionById(id);

  if (!auction) {
    throw new AppError(404, "Auction not found");
  }

  if (auction.createdById !== userId) {
    throw new Error("You are not allowed to start this auction");
  }

  if (auction.status !== AuctionStatus.SCHEDULED) {
    throw new Error("Only scheduled auctions can be started");
  }

  const now = new Date();

  if (auction.endsAt <= now) {
    throw new Error("Auction end time has already passed");
  }

  const updatedAuction = await updateAuctionStatus(id, AuctionStatus.ACTIVE);

  await redis.set(auctionHighestBidKey(id), Number(auction.currentPrice));
  await redis.set(auctionHighestBidderKey(id), auction.currentWinnerId || "");
  await redis.set(auctionStatusKey(id), AuctionStatus.ACTIVE);

  await scheduleCloseAuctionJob({
    auctionItemId: id,
    endsAt: auction.endsAt,
  });

  return updatedAuction;
}

export async function cancelAuctionService(id: string, userId: string) {
  const auction = await findAuctionById(id);

  if (!auction) {
    throw new AppError(404, "Auction not found");
  }

  if (auction.createdById !== userId) {
    throw new Error("You are not allowed to cancel this auction");
  }

  if (auction.status === AuctionStatus.ENDED) {
    throw new Error("Ended auction cannot be cancelled");
  }

  if (auction.status === AuctionStatus.CANCELLED) {
    throw new Error("Auction is already cancelled");
  }

  const updatedAuction = await updateAuctionStatus(id, AuctionStatus.CANCELLED);

  await redis.set(auctionStatusKey(id), AuctionStatus.CANCELLED);

  return updatedAuction;
}


export async function closeAuctionService(
  id: string,
  options?: {
    requestedByUserId?: string;
    manual?: boolean;
  }
) {
  const auction = await prisma.auctionItem.findUnique({
    where: {
      id,
    },
  });

  if (!auction) {
    throw new AppError(404, "Auction not found");
  }

  if (options?.manual) {
    if (auction.createdById !== options.requestedByUserId) {
      throw new Error("You are not allowed to close this auction");
    }

    if (auction.endsAt > new Date()) {
      throw new Error("Auction has not ended yet");
    }
  }

  if (auction.status === AuctionStatus.ENDED) {
    return auction;
  }

  if (auction.status === AuctionStatus.CANCELLED) {
    return auction;
  }

  const redisHighestBid = await redis.get(auctionHighestBidKey(id));
  const redisHighestBidder = await redis.get(auctionHighestBidderKey(id));

  const winningBid = redisHighestBid
    ? Number(redisHighestBid)
    : Number(auction.currentPrice);

  const winnerId =
    redisHighestBidder && redisHighestBidder.length > 0
      ? redisHighestBidder
      : auction.currentWinnerId;

  const updatedAuction = await prisma.auctionItem.update({
    where: {
      id,
    },
    data: {
      status: AuctionStatus.ENDED,
      currentPrice: winningBid,
      currentWinnerId: winnerId,
    },
  });

  await redis.set(auctionStatusKey(id), AuctionStatus.ENDED);

  emitAuctionEnded({
    auctionItemId: id,
    winningBid,
    winnerId,
  });

  if (winnerId) {
    await createAuctionWonNotification({
      userId: winnerId,
      auctionItemId: id,
      auctionTitle: auction.title,
      winningBid,
    });
  }

  return updatedAuction;
}
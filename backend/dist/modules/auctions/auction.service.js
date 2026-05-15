"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuctionService = createAuctionService;
exports.getAuctionsService = getAuctionsService;
exports.getAuctionDetailService = getAuctionDetailService;
exports.startAuctionService = startAuctionService;
exports.cancelAuctionService = cancelAuctionService;
exports.closeAuctionService = closeAuctionService;
const client_1 = require("@prisma/client");
const auction_repository_1 = require("./auction.repository");
const redis_1 = require("../../config/redis");
const bid_redis_keys_1 = require("../bids/bid.redis-keys");
const db_1 = require("../../config/db");
const auction_events_1 = require("./auction.events");
const auction_queue_1 = require("../../jobs/auction.queue");
const notification_service_1 = require("../notifications/notification.service");
function parseAuctionStatus(status) {
    if (!status)
        return undefined;
    const normalizedStatus = status.toUpperCase();
    if (normalizedStatus !== client_1.AuctionStatus.SCHEDULED &&
        normalizedStatus !== client_1.AuctionStatus.ACTIVE &&
        normalizedStatus !== client_1.AuctionStatus.ENDED &&
        normalizedStatus !== client_1.AuctionStatus.CANCELLED) {
        throw new Error("Invalid auction status");
    }
    return normalizedStatus;
}
async function createAuctionService(input, userId) {
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
    return (0, auction_repository_1.createAuction)({
        title,
        description,
        startingPrice,
        startsAt: startsAtDate,
        endsAt: endsAtDate,
        createdById: userId,
    });
}
async function getAuctionsService(query) {
    const status = parseAuctionStatus(query.status);
    return (0, auction_repository_1.findAuctions)({
        status,
        search: query.search,
    });
}
async function getAuctionDetailService(id) {
    const auction = await (0, auction_repository_1.findAuctionById)(id);
    if (!auction) {
        throw new Error("Auction not found");
    }
    return auction;
}
async function startAuctionService(id, userId) {
    const auction = await (0, auction_repository_1.findAuctionById)(id);
    if (!auction) {
        throw new Error("Auction not found");
    }
    if (auction.createdById !== userId) {
        throw new Error("You are not allowed to start this auction");
    }
    if (auction.status !== client_1.AuctionStatus.SCHEDULED) {
        throw new Error("Only scheduled auctions can be started");
    }
    const now = new Date();
    if (auction.endsAt <= now) {
        throw new Error("Auction end time has already passed");
    }
    const updatedAuction = await (0, auction_repository_1.updateAuctionStatus)(id, client_1.AuctionStatus.ACTIVE);
    await redis_1.redis.set((0, bid_redis_keys_1.auctionHighestBidKey)(id), Number(auction.currentPrice));
    await redis_1.redis.set((0, bid_redis_keys_1.auctionHighestBidderKey)(id), auction.currentWinnerId || "");
    await redis_1.redis.set((0, bid_redis_keys_1.auctionStatusKey)(id), client_1.AuctionStatus.ACTIVE);
    await (0, auction_queue_1.scheduleCloseAuctionJob)({
        auctionItemId: id,
        endsAt: auction.endsAt,
    });
    return updatedAuction;
}
async function cancelAuctionService(id, userId) {
    const auction = await (0, auction_repository_1.findAuctionById)(id);
    if (!auction) {
        throw new Error("Auction not found");
    }
    if (auction.createdById !== userId) {
        throw new Error("You are not allowed to cancel this auction");
    }
    if (auction.status === client_1.AuctionStatus.ENDED) {
        throw new Error("Ended auction cannot be cancelled");
    }
    if (auction.status === client_1.AuctionStatus.CANCELLED) {
        throw new Error("Auction is already cancelled");
    }
    const updatedAuction = await (0, auction_repository_1.updateAuctionStatus)(id, client_1.AuctionStatus.CANCELLED);
    await redis_1.redis.set((0, bid_redis_keys_1.auctionStatusKey)(id), client_1.AuctionStatus.CANCELLED);
    return updatedAuction;
}
async function closeAuctionService(id, options) {
    const auction = await db_1.prisma.auctionItem.findUnique({
        where: {
            id,
        },
    });
    if (!auction) {
        throw new Error("Auction not found");
    }
    if (options?.manual) {
        if (auction.createdById !== options.requestedByUserId) {
            throw new Error("You are not allowed to close this auction");
        }
        if (auction.endsAt > new Date()) {
            throw new Error("Auction has not ended yet");
        }
    }
    if (auction.status === client_1.AuctionStatus.ENDED) {
        return auction;
    }
    if (auction.status === client_1.AuctionStatus.CANCELLED) {
        return auction;
    }
    const redisHighestBid = await redis_1.redis.get((0, bid_redis_keys_1.auctionHighestBidKey)(id));
    const redisHighestBidder = await redis_1.redis.get((0, bid_redis_keys_1.auctionHighestBidderKey)(id));
    const winningBid = redisHighestBid
        ? Number(redisHighestBid)
        : Number(auction.currentPrice);
    const winnerId = redisHighestBidder && redisHighestBidder.length > 0
        ? redisHighestBidder
        : auction.currentWinnerId;
    const updatedAuction = await db_1.prisma.auctionItem.update({
        where: {
            id,
        },
        data: {
            status: client_1.AuctionStatus.ENDED,
            currentPrice: winningBid,
            currentWinnerId: winnerId,
        },
    });
    await redis_1.redis.set((0, bid_redis_keys_1.auctionStatusKey)(id), client_1.AuctionStatus.ENDED);
    (0, auction_events_1.emitAuctionEnded)({
        auctionItemId: id,
        winningBid,
        winnerId,
    });
    if (winnerId) {
        await (0, notification_service_1.createAuctionWonNotification)({
            userId: winnerId,
            auctionItemId: id,
            auctionTitle: auction.title,
            winningBid,
        });
    }
    return updatedAuction;
}

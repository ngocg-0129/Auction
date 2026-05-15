"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.placeBidService = placeBidService;
exports.getBidsByAuctionService = getBidsByAuctionService;
const client_1 = require("@prisma/client");
const db_1 = require("../../config/db");
const redis_1 = require("../../config/redis");
const bid_repository_1 = require("./bid.repository");
const bid_lua_1 = require("./bid.lua");
const bid_redis_keys_1 = require("./bid.redis-keys");
const bid_events_1 = require("./bid.events");
const notification_service_1 = require("../notifications/notification.service");
const metrics_1 = require("../../metrics");
async function placeBidService(auctionItemId, userId, input) {
    const { amount } = input;
    const endTimer = metrics_1.bidDurationHistogram.startTimer({ auction_id: auctionItemId });
    if (!amount || amount <= 0) {
        throw new Error("Bid amount must be greater than 0");
    }
    const auction = await db_1.prisma.auctionItem.findUnique({
        where: {
            id: auctionItemId,
        },
    });
    if (!auction) {
        throw new Error("Auction not found");
    }
    if (auction.status !== client_1.AuctionStatus.ACTIVE) {
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
    const redisResult = (await redis_1.redis.eval(bid_lua_1.placeBidLuaScript, 3, (0, bid_redis_keys_1.auctionHighestBidKey)(auctionItemId), (0, bid_redis_keys_1.auctionHighestBidderKey)(auctionItemId), (0, bid_redis_keys_1.auctionStatusKey)(auctionItemId), amount, userId));
    const [success, code, _previousBidAmount, previousWinnerId] = redisResult;
    if (success !== 1) {
        metrics_1.bidsCounter.inc({ auction_id: auctionItemId, status: 'error' }); // ← thêm
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
        const result = await db_1.prisma.$transaction(async (tx) => {
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
                    status: client_1.AuctionStatus.ACTIVE,
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
        (0, bid_events_1.emitNewBid)({
            auctionItemId,
            amount,
            bidderId: userId,
            bidderEmail: result.bid.user.email,
            bidderName: result.bid.user.fullName,
            createdAt: result.bid.createdAt,
        });
        if (previousWinnerId && previousWinnerId !== userId) {
            await (0, notification_service_1.createOutbidNotification)({
                userId: previousWinnerId,
                auctionItemId,
                auctionTitle,
                newAmount: amount,
            });
        }
        metrics_1.bidsCounter.inc({ auction_id: auctionItemId, status: 'success' }); // ← thêm
        endTimer();
        return result;
    }
    catch (error) {
        metrics_1.bidsCounter.inc({ auction_id: auctionItemId, status: 'error' }); // ← thêm
        endTimer();
        await rollbackRedisBidIfStillCurrent(auctionItemId, amount, userId);
        throw error;
    }
}
async function getBidsByAuctionService(auctionItemId) {
    const auction = await db_1.prisma.auctionItem.findUnique({
        where: {
            id: auctionItemId,
        },
    });
    if (!auction) {
        throw new Error("Auction not found");
    }
    return (0, bid_repository_1.findBidsByAuctionId)(auctionItemId);
}
async function ensureAuctionInRedis(auctionItemId, currentPrice) {
    const statusKey = (0, bid_redis_keys_1.auctionStatusKey)(auctionItemId);
    const highestBidKey = (0, bid_redis_keys_1.auctionHighestBidKey)(auctionItemId);
    const highestBidderKey = (0, bid_redis_keys_1.auctionHighestBidderKey)(auctionItemId);
    const status = await redis_1.redis.get(statusKey);
    const highestBid = await redis_1.redis.get(highestBidKey);
    if (!status) {
        await redis_1.redis.set(statusKey, client_1.AuctionStatus.ACTIVE);
    }
    if (!highestBid) {
        await redis_1.redis.set(highestBidKey, currentPrice);
    }
    const highestBidder = await redis_1.redis.get(highestBidderKey);
    if (highestBidder === null) {
        await redis_1.redis.set(highestBidderKey, "");
    }
}
async function rollbackRedisBidIfStillCurrent(auctionItemId, failedAmount, failedUserId) {
    const redisAmount = await redis_1.redis.get((0, bid_redis_keys_1.auctionHighestBidKey)(auctionItemId));
    const redisBidder = await redis_1.redis.get((0, bid_redis_keys_1.auctionHighestBidderKey)(auctionItemId));
    if (Number(redisAmount) !== failedAmount || redisBidder !== failedUserId) {
        return;
    }
    const highestBid = await db_1.prisma.bid.findFirst({
        where: {
            auctionItemId,
        },
        orderBy: {
            amount: "desc",
        },
    });
    const auction = await db_1.prisma.auctionItem.findUnique({
        where: {
            id: auctionItemId,
        },
    });
    if (!auction) {
        return;
    }
    if (!highestBid) {
        await redis_1.redis.set((0, bid_redis_keys_1.auctionHighestBidKey)(auctionItemId), Number(auction.startingPrice));
        await redis_1.redis.set((0, bid_redis_keys_1.auctionHighestBidderKey)(auctionItemId), "");
        return;
    }
    await redis_1.redis.set((0, bid_redis_keys_1.auctionHighestBidKey)(auctionItemId), Number(highestBid.amount));
    await redis_1.redis.set((0, bid_redis_keys_1.auctionHighestBidderKey)(auctionItemId), highestBid.userId);
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findBidsByAuctionId = findBidsByAuctionId;
const db_1 = require("../../config/db");
async function findBidsByAuctionId(auctionItemId) {
    return db_1.prisma.bid.findMany({
        where: {
            auctionItemId,
        },
        orderBy: {
            createdAt: "desc",
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
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuction = createAuction;
exports.findAuctions = findAuctions;
exports.findAuctionById = findAuctionById;
exports.updateAuctionStatus = updateAuctionStatus;
const client_1 = require("@prisma/client");
const db_1 = require("../../config/db");
async function createAuction(data) {
    return db_1.prisma.auctionItem.create({
        data: {
            title: data.title,
            description: data.description,
            startingPrice: data.startingPrice,
            currentPrice: data.startingPrice,
            startsAt: data.startsAt,
            endsAt: data.endsAt,
            createdById: data.createdById,
            status: client_1.AuctionStatus.SCHEDULED,
        },
        include: {
            createdBy: {
                select: {
                    id: true,
                    email: true,
                    fullName: true,
                },
            },
        },
    });
}
async function findAuctions(params) {
    const where = {};
    if (params.status) {
        where.status = params.status;
    }
    if (params.search) {
        where.OR = [
            {
                title: {
                    contains: params.search,
                    mode: "insensitive",
                },
            },
            {
                description: {
                    contains: params.search,
                    mode: "insensitive",
                },
            },
        ];
    }
    return db_1.prisma.auctionItem.findMany({
        where,
        orderBy: {
            createdAt: "desc",
        },
        include: {
            createdBy: {
                select: {
                    id: true,
                    email: true,
                    fullName: true,
                },
            },
            currentWinner: {
                select: {
                    id: true,
                    email: true,
                    fullName: true,
                },
            },
            _count: {
                select: {
                    bids: true,
                },
            },
        },
    });
}
async function findAuctionById(id) {
    return db_1.prisma.auctionItem.findUnique({
        where: { id },
        include: {
            createdBy: {
                select: {
                    id: true,
                    email: true,
                    fullName: true,
                },
            },
            currentWinner: {
                select: {
                    id: true,
                    email: true,
                    fullName: true,
                },
            },
            bids: {
                orderBy: {
                    createdAt: "desc",
                },
                take: 10,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            fullName: true,
                        },
                    },
                },
            },
        },
    });
}
async function updateAuctionStatus(id, status) {
    return db_1.prisma.auctionItem.update({
        where: { id },
        data: { status },
    });
}

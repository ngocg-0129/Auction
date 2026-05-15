"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = createNotification;
exports.findNotificationsByUserId = findNotificationsByUserId;
exports.markNotificationAsRead = markNotificationAsRead;
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
const db_1 = require("../../config/db");
async function createNotification(data) {
    return db_1.prisma.notification.create({
        data: {
            userId: data.userId,
            type: data.type,
            title: data.title,
            message: data.message,
            auctionItemId: data.auctionItemId,
        },
    });
}
async function findNotificationsByUserId(userId) {
    return db_1.prisma.notification.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            auctionItem: {
                select: {
                    id: true,
                    title: true,
                    currentPrice: true,
                    status: true,
                },
            },
        },
    });
}
async function markNotificationAsRead(id, userId) {
    return db_1.prisma.notification.updateMany({
        where: {
            id,
            userId,
        },
        data: {
            isRead: true,
        },
    });
}
async function markAllNotificationsAsRead(userId) {
    return db_1.prisma.notification.updateMany({
        where: {
            userId,
            isRead: false,
        },
        data: {
            isRead: true,
        },
    });
}

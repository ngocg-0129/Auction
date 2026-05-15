"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOutbidNotification = createOutbidNotification;
exports.createAuctionWonNotification = createAuctionWonNotification;
exports.getMyNotificationsService = getMyNotificationsService;
exports.markNotificationReadService = markNotificationReadService;
exports.markAllNotificationsReadService = markAllNotificationsReadService;
const client_1 = require("@prisma/client");
const notification_repository_1 = require("./notification.repository");
async function createOutbidNotification(data) {
    return (0, notification_repository_1.createNotification)({
        userId: data.userId,
        type: client_1.NotificationType.OUTBID,
        auctionItemId: data.auctionItemId,
        title: "Bạn đã bị vượt giá",
        message: `Bạn đã bị vượt giá trong phiên đấu giá "${data.auctionTitle}". Giá mới là ${data.newAmount}.`,
    });
}
async function createAuctionWonNotification(data) {
    return (0, notification_repository_1.createNotification)({
        userId: data.userId,
        type: client_1.NotificationType.AUCTION_WON,
        auctionItemId: data.auctionItemId,
        title: "Bạn đã thắng phiên đấu giá",
        message: `Chúc mừng! Bạn đã thắng phiên đấu giá "${data.auctionTitle}" với giá ${data.winningBid}.`,
    });
}
async function getMyNotificationsService(userId) {
    return (0, notification_repository_1.findNotificationsByUserId)(userId);
}
async function markNotificationReadService(id, userId) {
    const result = await (0, notification_repository_1.markNotificationAsRead)(id, userId);
    if (result.count === 0) {
        throw new Error("Notification not found");
    }
    return {
        success: true,
    };
}
async function markAllNotificationsReadService(userId) {
    await (0, notification_repository_1.markAllNotificationsAsRead)(userId);
    return {
        success: true,
    };
}

import { NotificationType } from "@prisma/client";
import {
  createNotification,
  findNotificationsByUserId,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "./notification.repository";

export async function createOutbidNotification(data: {
  userId: string;
  auctionItemId: string;
  auctionTitle: string;
  newAmount: number;
}) {
  return createNotification({
    userId: data.userId,
    type: NotificationType.OUTBID,
    auctionItemId: data.auctionItemId,
    title: "Bạn đã bị vượt giá",
    message: `Bạn đã bị vượt giá trong phiên đấu giá "${data.auctionTitle}". Giá mới là ${data.newAmount}.`,
  });
}

export async function createAuctionWonNotification(data: {
  userId: string;
  auctionItemId: string;
  auctionTitle: string;
  winningBid: number;
}) {
  return createNotification({
    userId: data.userId,
    type: NotificationType.AUCTION_WON,
    auctionItemId: data.auctionItemId,
    title: "Bạn đã thắng phiên đấu giá",
    message: `Chúc mừng! Bạn đã thắng phiên đấu giá "${data.auctionTitle}" với giá ${data.winningBid}.`,
  });
}

export async function getMyNotificationsService(userId: string) {
  return findNotificationsByUserId(userId);
}

export async function markNotificationReadService(id: string, userId: string) {
  const result = await markNotificationAsRead(id, userId);

  if (result.count === 0) {
    throw new Error("Notification not found");
  }

  return {
    success: true,
  };
}

export async function markAllNotificationsReadService(userId: string) {
  await markAllNotificationsAsRead(userId);

  return {
    success: true,
  };
}
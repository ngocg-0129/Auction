import { getSocketServer } from "../../config/socket";

export function emitNewBid(data: {
  auctionItemId: string;
  amount: number;
  bidderId: string;
  bidderEmail?: string;
  bidderName?: string | null;
  createdAt: Date;
}) {
  const io = getSocketServer();

  io.to(`auction:${data.auctionItemId}`).emit("bid:new", {
    auctionItemId: data.auctionItemId,
    amount: data.amount,
    bidderId: data.bidderId,
    bidderEmail: data.bidderEmail,
    bidderName: data.bidderName,
    createdAt: data.createdAt,
  });
}
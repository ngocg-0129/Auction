import { getSocketServer } from "../../config/socket";

export function emitAuctionEnded(data: {
  auctionItemId: string;
  winningBid: number;
  winnerId: string | null;
}) {
  const io = getSocketServer();

  io.to(`auction:${data.auctionItemId}`).emit("auction:ended", {
    auctionItemId: data.auctionItemId,
    winningBid: data.winningBid,
    winnerId: data.winnerId,
  });
}
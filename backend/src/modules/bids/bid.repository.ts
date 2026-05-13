import { prisma } from "../../config/db";

export async function findBidsByAuctionId(auctionItemId: string) {
  return prisma.bid.findMany({
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
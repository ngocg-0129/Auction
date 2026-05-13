import { AuctionStatus, Prisma } from "@prisma/client";
import { prisma } from "../../config/db";

export async function createAuction(data: {
  title: string;
  description?: string;
  startingPrice: number;
  startsAt: Date;
  endsAt: Date;
  createdById: string;
}) {
  return prisma.auctionItem.create({
    data: {
      title: data.title,
      description: data.description,
      startingPrice: data.startingPrice,
      currentPrice: data.startingPrice,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
      createdById: data.createdById,
      status: AuctionStatus.SCHEDULED,
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

export async function findAuctions(params: {
  status?: AuctionStatus;
  search?: string;
}) {
  const where: Prisma.AuctionItemWhereInput = {};

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

  return prisma.auctionItem.findMany({
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

export async function findAuctionById(id: string) {
  return prisma.auctionItem.findUnique({
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

export async function updateAuctionStatus(
  id: string,
  status: AuctionStatus
) {
  return prisma.auctionItem.update({
    where: { id },
    data: { status },
  });
}
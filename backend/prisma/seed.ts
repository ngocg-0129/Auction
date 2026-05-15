import { PrismaClient, AuctionStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const seller = await prisma.user.upsert({
    where: {
      email: "seller@example.com",
    },
    update: {},
    create: {
      email: "seller@example.com",
      passwordHash,
      fullName: "Demo Seller",
    },
  });

  const bidderOne = await prisma.user.upsert({
    where: {
      email: "bidder1@example.com",
    },
    update: {},
    create: {
      email: "bidder1@example.com",
      passwordHash,
      fullName: "Demo Bidder One",
    },
  });

  const bidderTwo = await prisma.user.upsert({
    where: {
      email: "bidder2@example.com",
    },
    update: {},
    create: {
      email: "bidder2@example.com",
      passwordHash,
      fullName: "Demo Bidder Two",
    },
  });

  const existingAuction = await prisma.auctionItem.findFirst({
    where: {
      title: "Demo Auction Item",
      createdById: seller.id,
    },
  });

  if (!existingAuction) {
    await prisma.auctionItem.create({
      data: {
        title: "Demo Auction Item",
        description: "Sample auction item for Docker testing",
        startingPrice: 100,
        currentPrice: 100,
        startsAt: new Date(Date.now() - 5 * 60 * 1000),
        endsAt: new Date(Date.now() + 60 * 60 * 1000),
        status: AuctionStatus.SCHEDULED,
        createdById: seller.id,
      },
    });
  }

  console.log("Seed completed");
  console.log("Seller:", seller.email);
  console.log("Bidder 1:", bidderOne.email);
  console.log("Bidder 2:", bidderTwo.email);
  console.log("Password for all demo users: Password123!");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
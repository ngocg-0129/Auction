import { z } from "zod";

export const placeBidSchema = z
  .object({
    amount: z.coerce.number().positive("Bid amount must be greater than 0"),
  })
  .strict();

export const auctionBidParamsSchema = z.object({
  id: z.string().uuid("Invalid auction id"),
});
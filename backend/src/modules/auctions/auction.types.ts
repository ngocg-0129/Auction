import { z } from "zod";
import {
  auctionListQuerySchema,
  createAuctionSchema,
} from "./auction.validation";

export type CreateAuctionInput = z.infer<typeof createAuctionSchema>;

export type AuctionListQuery = z.infer<typeof auctionListQuerySchema>;
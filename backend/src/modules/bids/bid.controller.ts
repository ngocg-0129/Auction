import { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler";
import * as bidService from "./bid.service";
import { auctionBidParamsSchema, placeBidSchema } from "./bid.validation";


function getUserIdFromRequest(req: Request): string {
  if (!req.user) {
    throw new Error("Unauthorized");
  }

  return req.user.userId;
}

export const placeBid = asyncHandler(async (req: Request, res: Response) => {
  const { id } = auctionBidParamsSchema.parse(req.params);
  const userId = getUserIdFromRequest(req);
  const body = placeBidSchema.parse(req.body);

  const result = await bidService.placeBidService(id, userId, body);

  res.status(201).json({
    message: "Bid placed successfully",
    data: result,
  });
});

export const getBidsByAuction = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = auctionBidParamsSchema.parse(req.params);

    const result = await bidService.getBidsByAuctionService(id);

    res.json({
      message: "Get bids successfully",
      data: result,
    });
  }
);
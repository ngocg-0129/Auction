import { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler";
import * as bidService from "./bid.service";

function getUserIdFromRequest(req: Request): string {
  if (!req.user) {
    throw new Error("Unauthorized");
  }

  return req.user.userId;
}

export const placeBid = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = getUserIdFromRequest(req);

  const result = await bidService.placeBidService(id, userId, req.body);

  res.status(201).json({
    message: "Bid placed successfully",
    data: result,
  });
});

export const getBidsByAuction = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await bidService.getBidsByAuctionService(id);

    res.json({
      message: "Get bids successfully",
      data: result,
    });
  }
);
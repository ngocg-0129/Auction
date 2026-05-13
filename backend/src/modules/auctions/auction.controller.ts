import { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler";
import * as auctionService from "./auction.service";

function getUserIdFromRequest(req: Request): string {
  if (!req.user) {
    throw new Error("Unauthorized");
  }

  return req.user.userId;
}

export const createAuction = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result = await auctionService.createAuctionService(
      req.body,
      userId
    );

    res.status(201).json({
      message: "Auction created successfully",
      data: result,
    });
  }
);

export const getAuctions = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await auctionService.getAuctionsService({
      status: req.query.status as string | undefined,
      search: req.query.search as string | undefined,
    });

    res.json({
      message: "Get auctions successfully",
      data: result,
    });
  }
);

export const getAuctionDetail = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await auctionService.getAuctionDetailService(id);

    res.json({
      message: "Get auction detail successfully",
      data: result,
    });
  }
);

export const startAuction = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = getUserIdFromRequest(req);

    const result = await auctionService.startAuctionService(id, userId);

    res.json({
      message: "Auction started successfully",
      data: result,
    });
  }
);

export const cancelAuction = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = getUserIdFromRequest(req);

    const result = await auctionService.cancelAuctionService(id, userId);

    res.json({
      message: "Auction cancelled successfully",
      data: result,
    });
  }
);
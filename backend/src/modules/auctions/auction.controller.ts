import { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler";
import * as auctionService from "./auction.service";
import {
  auctionIdParamsSchema,
  auctionListQuerySchema,
  createAuctionSchema,
} from "./auction.validation";


function getUserIdFromRequest(req: Request): string {
  if (!req.user) {
    throw new Error("Unauthorized");
  }

  return req.user.userId;
}

export const createAuction = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);
    const body = createAuctionSchema.parse(req.body);

    const result = await auctionService.createAuctionService(body, userId);

    res.status(201).json({
      message: "Auction created successfully",
      data: result,
    });
  }
);

export const getAuctions = asyncHandler(
  async (req: Request, res: Response) => {
    const query = auctionListQuerySchema.parse(req.query);

    const result = await auctionService.getAuctionsService(query);

    res.json({
      message: "Get auctions successfully",
      data: result,
    });
  }
);

export const getAuctionDetail = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = auctionIdParamsSchema.parse(req.params);

    const result = await auctionService.getAuctionDetailService(id as string);

    res.json({
      message: "Get auction detail successfully",
      data: result,
    });
  }
);

export const startAuction = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = auctionIdParamsSchema.parse(req.params);
    const userId = getUserIdFromRequest(req);

    const result = await auctionService.startAuctionService(id as string, userId);

    res.json({
      message: "Auction started successfully",
      data: result,
    });
  }
);

export const cancelAuction = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = auctionIdParamsSchema.parse(req.params);
    const userId = getUserIdFromRequest(req);

    const result = await auctionService.cancelAuctionService(id as string, userId);

    res.json({
      message: "Auction cancelled successfully",
      data: result,
    });
  }
);

export const closeAuction = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = auctionIdParamsSchema.parse(req.params);
    const userId = getUserIdFromRequest(req);

    const result = await auctionService.closeAuctionService(id as string, {
      requestedByUserId: userId,
      manual: true,
    });

    res.json({
      message: "Auction closed successfully",
      data: result,
    });
  }
);
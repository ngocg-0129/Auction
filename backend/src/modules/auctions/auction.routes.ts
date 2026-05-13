import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import * as auctionController from "./auction.controller";

const router = Router();

router.get("/", auctionController.getAuctions);
router.get("/:id", auctionController.getAuctionDetail);

router.post("/", requireAuth, auctionController.createAuction);
router.post("/:id/start", requireAuth, auctionController.startAuction);
router.post("/:id/cancel", requireAuth, auctionController.cancelAuction);

export default router;
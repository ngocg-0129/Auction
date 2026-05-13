import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import * as bidController from "./bid.controller";

const router = Router();

router.get("/auctions/:id/bids", bidController.getBidsByAuction);
router.post("/auctions/:id/bids", requireAuth, bidController.placeBid);

export default router;
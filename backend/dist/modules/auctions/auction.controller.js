"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeAuction = exports.cancelAuction = exports.startAuction = exports.getAuctionDetail = exports.getAuctions = exports.createAuction = void 0;
const async_handler_1 = require("../../utils/async-handler");
const auctionService = __importStar(require("./auction.service"));
function getUserIdFromRequest(req) {
    if (!req.user) {
        throw new Error("Unauthorized");
    }
    return req.user.userId;
}
exports.createAuction = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const userId = getUserIdFromRequest(req);
    const result = await auctionService.createAuctionService(req.body, userId);
    res.status(201).json({
        message: "Auction created successfully",
        data: result,
    });
});
exports.getAuctions = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const result = await auctionService.getAuctionsService({
        status: req.query.status,
        search: req.query.search,
    });
    res.json({
        message: "Get auctions successfully",
        data: result,
    });
});
exports.getAuctionDetail = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const result = await auctionService.getAuctionDetailService(id);
    res.json({
        message: "Get auction detail successfully",
        data: result,
    });
});
exports.startAuction = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = getUserIdFromRequest(req);
    const result = await auctionService.startAuctionService(id, userId);
    res.json({
        message: "Auction started successfully",
        data: result,
    });
});
exports.cancelAuction = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = getUserIdFromRequest(req);
    const result = await auctionService.cancelAuctionService(id, userId);
    res.json({
        message: "Auction cancelled successfully",
        data: result,
    });
});
exports.closeAuction = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = getUserIdFromRequest(req);
    const result = await auctionService.closeAuctionService(id, {
        requestedByUserId: userId,
        manual: true,
    });
    res.json({
        message: "Auction closed successfully",
        data: result,
    });
});

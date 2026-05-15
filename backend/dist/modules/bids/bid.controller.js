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
exports.getBidsByAuction = exports.placeBid = void 0;
const async_handler_1 = require("../../utils/async-handler");
const bidService = __importStar(require("./bid.service"));
function getUserIdFromRequest(req) {
    if (!req.user) {
        throw new Error("Unauthorized");
    }
    return req.user.userId;
}
exports.placeBid = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = getUserIdFromRequest(req);
    const result = await bidService.placeBidService(id, userId, req.body);
    res.status(201).json({
        message: "Bid placed successfully",
        data: result,
    });
});
exports.getBidsByAuction = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const result = await bidService.getBidsByAuctionService(id);
    res.json({
        message: "Get bids successfully",
        data: result,
    });
});

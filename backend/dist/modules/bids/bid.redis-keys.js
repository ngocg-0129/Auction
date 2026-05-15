"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auctionHighestBidKey = auctionHighestBidKey;
exports.auctionHighestBidderKey = auctionHighestBidderKey;
exports.auctionStatusKey = auctionStatusKey;
function auctionHighestBidKey(auctionItemId) {
    return `auction:${auctionItemId}:highest_bid`;
}
function auctionHighestBidderKey(auctionItemId) {
    return `auction:${auctionItemId}:highest_bidder`;
}
function auctionStatusKey(auctionItemId) {
    return `auction:${auctionItemId}:status`;
}

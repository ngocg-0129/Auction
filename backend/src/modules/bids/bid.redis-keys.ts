export function auctionHighestBidKey(auctionItemId: string) {
  return `auction:${auctionItemId}:highest_bid`;
}

export function auctionHighestBidderKey(auctionItemId: string) {
  return `auction:${auctionItemId}:highest_bidder`;
}

export function auctionStatusKey(auctionItemId: string) {
  return `auction:${auctionItemId}:status`;
}
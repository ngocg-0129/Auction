"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.placeBidLuaScript = void 0;
exports.placeBidLuaScript = `
local highestBidKey = KEYS[1]
local highestBidderKey = KEYS[2]
local statusKey = KEYS[3]

local newBid = tonumber(ARGV[1])
local bidderId = ARGV[2]

local status = redis.call("GET", statusKey)

if status ~= "ACTIVE" then
  return {0, "AUCTION_NOT_ACTIVE", "", ""}
end

local currentBid = redis.call("GET", highestBidKey)

if not currentBid then
  return {0, "AUCTION_NOT_INITIALIZED", "", ""}
end

local previousBidder = redis.call("GET", highestBidderKey) or ""

currentBid = tonumber(currentBid)

if newBid <= currentBid then
  return {0, "BID_TOO_LOW", tostring(currentBid), previousBidder}
end

redis.call("SET", highestBidKey, newBid)
redis.call("SET", highestBidderKey, bidderId)

return {1, "BID_ACCEPTED", tostring(currentBid), previousBidder}
`;

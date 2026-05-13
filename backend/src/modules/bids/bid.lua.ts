export const placeBidLuaScript = `
local highestBidKey = KEYS[1]
local highestBidderKey = KEYS[2]
local statusKey = KEYS[3]

local newBid = tonumber(ARGV[1])
local bidderId = ARGV[2]

local status = redis.call("GET", statusKey)

if status ~= "ACTIVE" then
  return {0, "AUCTION_NOT_ACTIVE"}
end

local currentBid = redis.call("GET", highestBidKey)

if not currentBid then
  return {0, "AUCTION_NOT_INITIALIZED"}
end

currentBid = tonumber(currentBid)

if newBid <= currentBid then
  return {0, "BID_TOO_LOW"}
end

redis.call("SET", highestBidKey, newBid)
redis.call("SET", highestBidderKey, bidderId)

return {1, "BID_ACCEPTED"}
`;
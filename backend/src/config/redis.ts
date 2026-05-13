import Redis from "ioredis";
import { env } from "./env";

export const redis = new Redis({
  host: env.redisHost,
  port: env.redisPort,
});

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("error", (error) => {
  console.error("Redis error:", error);
});
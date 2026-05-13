// Gom biến môi trường vào 1 chỗ

import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || "3000",
  databaseUrl: process.env.DATABASE_URL || "",
  nodeEnv: process.env.NODE_ENV || "development",

  jwtSecret: process.env.JWT_SECRET || "default_secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  redisHost: process.env.REDIS_HOST || "localhost",
  redisPort: Number(process.env.REDIS_PORT || 6379),
};
"use strict";
// Gom biến môi trường vào 1 chỗ
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.env = {
    port: process.env.PORT || "3000",
    databaseUrl: process.env.DATABASE_URL || "",
    nodeEnv: process.env.NODE_ENV || "development",
    jwtSecret: process.env.JWT_SECRET || "",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
    redisUrl: process.env.REDIS_URL,
    redisHost: process.env.REDIS_HOST || "localhost",
    redisPort: Number(process.env.REDIS_PORT || 6379),
};
if (!exports.env.jwtSecret) {
    throw new Error("JWT_SECRET is required");
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const socket_1 = require("./config/socket");
const auction_worker_1 = require("./jobs/auction.worker");
const server = http_1.default.createServer(app_1.default);
(0, socket_1.initSocket)(server);
(0, auction_worker_1.startAuctionWorker)();
server.listen(Number(env_1.env.port), () => {
    console.log(`Server is running on port ${env_1.env.port}`);
});

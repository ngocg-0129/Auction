"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const error_middleware_1 = require("./middlewares/error.middleware");
const not_found_middleware_1 = require("./middlewares/not-found.middleware");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const auction_routes_1 = __importDefault(require("./modules/auctions/auction.routes"));
const bid_routes_1 = __importDefault(require("./modules/bids/bid.routes"));
const notification_routes_1 = __importDefault(require("./modules/notifications/notification.routes"));
const metrics_1 = require("./metrics");
const app = (0, express_1.default)();
app.use((0, cors_1.default)()); // cho phép FE gọi API
app.use(express_1.default.json()); // cho phép đọc JSON BODY
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        message: "Real-time Auction API is running",
    });
});
app.get("/metrics", async (req, res) => {
    res.set("Content-Type", metrics_1.register.contentType);
    res.end(await metrics_1.register.metrics());
});
app.use("/api/auth", auth_routes_1.default);
app.use("/api/auctions", auction_routes_1.default);
app.use("/api", bid_routes_1.default);
app.use("/api/notifications", notification_routes_1.default);
app.use(not_found_middleware_1.notFoundMiddleware);
app.use(error_middleware_1.errorMiddleware);
exports.default = app;

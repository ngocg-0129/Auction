"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bidDurationHistogram = exports.bidsCounter = exports.register = void 0;
const prom_client_1 = require("prom-client");
// Tạo registry riêng
exports.register = new prom_client_1.Registry();
// Thu thập metrics mặc định của Node.js (CPU, RAM, event loop...)
(0, prom_client_1.collectDefaultMetrics)({ register: exports.register });
// Counter: đếm tổng số lượt đặt giá
exports.bidsCounter = new prom_client_1.Counter({
    name: 'auction_bids_total',
    help: 'Tổng số lượt đặt giá',
    labelNames: ['auction_id', 'status'], // status: success | error
    registers: [exports.register],
});
// Histogram: đo thời gian xử lý mỗi lượt đặt giá
exports.bidDurationHistogram = new prom_client_1.Histogram({
    name: 'auction_bid_duration_seconds',
    help: 'Thời gian xử lý mỗi lượt đặt giá (giây)',
    labelNames: ['auction_id'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
    registers: [exports.register],
});

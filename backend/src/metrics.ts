import { Registry, Counter, Histogram, collectDefaultMetrics } from 'prom-client';

// Tạo registry riêng
export const register = new Registry();

// Thu thập metrics mặc định của Node.js (CPU, RAM, event loop...)
collectDefaultMetrics({ register });

// Counter: đếm tổng số lượt đặt giá
export const bidsCounter = new Counter({
  name: 'auction_bids_total',
  help: 'Tổng số lượt đặt giá',
  labelNames: ['auction_id', 'status'], // status: success | error
  registers: [register],
});

// Histogram: đo thời gian xử lý mỗi lượt đặt giá
export const bidDurationHistogram = new Histogram({
  name: 'auction_bid_duration_seconds',
  help: 'Thời gian xử lý mỗi lượt đặt giá (giây)',
  labelNames: ['auction_id'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
  registers: [register],
});
import express from "express";
import cors from "cors";
import { errorMiddleware } from "./middlewares/error.middleware";
import { notFoundMiddleware } from "./middlewares/not-found.middleware";
import authRoutes from "./modules/auth/auth.routes";
import auctionRoutes from "./modules/auctions/auction.routes";
import bidRoutes from "./modules/bids/bid.routes";
import notificationRoutes from "./modules/notifications/notification.routes";
import { register } from "./metrics";
import { env } from "./config/env";

const app = express();

app.use(
  cors({
    origin: env.corsOrigins,
    credentials: true,
  })
);
 // cho phép FE gọi API
app.use(express.json()); // cho phép đọc JSON BODY

app.get("/health", (req, res) => { // API Test server còn sống không
  res.json({
    status: "ok",
    message: "Real-time Auction API is running",
  });
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.use("/api/auth", authRoutes);
app.use("/api/auctions", auctionRoutes);
app.use("/api", bidRoutes);
app.use("/api/notifications", notificationRoutes);


app.use(notFoundMiddleware);
app.use(errorMiddleware);


export default app;
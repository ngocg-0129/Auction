import express from "express";
import cors from "cors";
import { errorMiddleware } from "./middlewares/error.middleware";
import { notFoundMiddleware } from "./middlewares/not-found.middleware";
import authRoutes from "./modules/auth/auth.routes";

const app = express();

app.use(cors()); // cho phép FE gọi API
app.use(express.json()); // cho phép đọc JSON BODY

app.get("/health", (req, res) => { // API Test server còn sống không
  res.json({
    status: "ok",
    message: "Real-time Auction API is running",
  });
});

app.use("/api/auth", authRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);


export default app;
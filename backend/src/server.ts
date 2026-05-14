import http from "http";
import app from "./app";
import { env } from "./config/env";
import { initSocket } from "./config/socket";
import { startAuctionWorker } from "./jobs/auction.worker";

const server = http.createServer(app);

initSocket(server);
startAuctionWorker();

server.listen(Number(env.port), () => {
  console.log(`Server is running on port ${env.port}`);
});
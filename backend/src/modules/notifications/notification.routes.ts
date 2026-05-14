import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import * as notificationController from "./notification.controller";

const router = Router();

router.get("/", requireAuth, notificationController.getMyNotifications);
router.patch(
  "/read-all",
  requireAuth,
  notificationController.markAllNotificationsRead
);
router.patch(
  "/:id/read",
  requireAuth,
  notificationController.markNotificationRead
);

export default router;
import { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler";
import * as notificationService from "./notification.service";

function getUserIdFromRequest(req: Request): string {
  if (!req.user) {
    throw new Error("Unauthorized");
  }

  return req.user.userId;
}

export const getMyNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result = await notificationService.getMyNotificationsService(userId);

    res.json({
      message: "Get notifications successfully",
      data: result,
    });
  }
);

export const markNotificationRead = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result = await notificationService.markNotificationReadService(
      req.params.id as string,
      userId
    );

    res.json({
      message: "Notification marked as read",
      data: result,
    });
  }
);

export const markAllNotificationsRead = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getUserIdFromRequest(req);

    const result =
      await notificationService.markAllNotificationsReadService(userId);

    res.json({
      message: "All notifications marked as read",
      data: result,
    });
  }
);
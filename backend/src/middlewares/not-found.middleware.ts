import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error";

export function notFoundMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  next(new AppError(404, `Route ${req.originalUrl} not found`));
}
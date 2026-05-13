import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../../utils/jwt";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    res.status(401).json({
      message: "Authorization header is required",
    });
    return;
  }

  const [type, token] = authorization.split(" ");

  if (type !== "Bearer" || !token) {
    res.status(401).json({
      message: "Invalid authorization format",
    });
    return;
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}
import { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler";
import * as authService from "./auth.service";
import { loginSchema, registerSchema } from "./auth.validation";



export const register = asyncHandler(async (req: Request, res: Response) => {
  const body = registerSchema.parse(req.body);
  const result = await authService.register(body);

  res.status(201).json({
    message: "Register successfully",
    data: result,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const body = loginSchema.parse(req.body);
  const result = await authService.login(body);

  res.json({
    message: "Login successfully",
    data: result,
  });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new Error("Unauthorized");
  }

  const result = await authService.getMe(req.user.userId);

  res.json({
    message: "Get current user successfully",
    data: result,
  });
});
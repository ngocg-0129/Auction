import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.string().trim().email("Email is invalid"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password is too long"),
    fullName: z
      .string()
      .trim()
      .min(1, "Full name cannot be empty")
      .max(100, "Full name is too long")
      .optional(),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().trim().email("Email is invalid"),
    password: z.string().min(1, "Password is required"),
  })
  .strict();
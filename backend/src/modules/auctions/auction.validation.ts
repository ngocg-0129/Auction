import { z } from "zod";

const dateStringSchema = z
  .string()
  .min(1, "Date is required")
  .refine((value) => !Number.isNaN(new Date(value).getTime()), {
    message: "Date is invalid",
  });

export const createAuctionSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(150, "Title is too long"),
    description: z
      .string()
      .trim()
      .max(2000, "Description is too long")
      .optional(),
    startingPrice: z.coerce
      .number()
      .positive("Starting price must be greater than 0"),
    startsAt: dateStringSchema,
    endsAt: dateStringSchema,
  })
  .strict()
  .superRefine((data, ctx) => {
    const startsAt = new Date(data.startsAt);
    const endsAt = new Date(data.endsAt);

    if (endsAt <= startsAt) {
      ctx.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "endsAt must be after startsAt",
      });
    }
  });

export const auctionListQuerySchema = z.object({
  status: z
    .enum(["SCHEDULED", "ACTIVE", "ENDED", "CANCELLED"], {
      message: "Invalid auction status",
    })
    .optional(),
  search: z
    .string()
    .trim()
    .min(1, "Search cannot be empty")
    .max(100, "Search is too long")
    .optional(),
});

export const auctionIdParamsSchema = z.object({
  id: z.string().uuid("Invalid auction id"),
});
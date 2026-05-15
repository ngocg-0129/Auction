import { z } from "zod";
import { placeBidSchema } from "./bid.validation";

export type PlaceBidInput = z.infer<typeof placeBidSchema>;
import { z } from "zod";
import { optionalImageUrlSchema } from "@/lib/validation/url";

export const accountProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(100),
  bio: z.string().trim().max(280, "Keep it under 280 characters.").optional(),
  avatarUrl: optionalImageUrlSchema,
});

export type AccountProfileInput = z.infer<typeof accountProfileSchema>;

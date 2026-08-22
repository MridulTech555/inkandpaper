import { z } from "zod";

export const profileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(100),
  bio: z.string().trim().max(500).optional(),
  avatarUrl: z.union([z.url("Enter a valid URL."), z.literal("")]).optional(),
  twitter: z.union([z.url("Enter a valid URL."), z.literal("")]).optional(),
  website: z.union([z.url("Enter a valid URL."), z.literal("")]).optional(),
});

export type ProfileFormInput = z.infer<typeof profileFormSchema>;

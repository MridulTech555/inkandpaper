import { z } from "zod";
import { optionalImageUrlSchema } from "@/lib/validation/url";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const categoryFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80),
  slug: z
    .string()
    .trim()
    .max(100)
    .regex(slugPattern, "Use lowercase letters, numbers, and hyphens only.")
    .optional()
    .or(z.literal("")),
  description: z.string().trim().max(300).optional().or(z.literal("")),
  image: optionalImageUrlSchema,
});

export type CategoryFormInput = z.infer<typeof categoryFormSchema>;

export const tagFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(50),
  slug: z
    .string()
    .trim()
    .max(60)
    .regex(slugPattern, "Use lowercase letters, numbers, and hyphens only.")
    .optional()
    .or(z.literal("")),
});

export type TagFormInput = z.infer<typeof tagFormSchema>;

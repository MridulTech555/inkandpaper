import { z } from "zod";

export const ARTICLE_FORM_STATUSES = [
  "DRAFT",
  "IN_REVIEW",
  "SCHEDULED",
  "PUBLISHED",
] as const;

export const articleFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters.")
      .max(200),
    slug: z
      .string()
      .trim()
      .min(3, "Slug must be at least 3 characters.")
      .max(220)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Use lowercase letters, numbers, and hyphens only.",
      ),
    excerpt: z.string().trim().max(300).optional(),
    featuredImage: z
      .union([z.url("Enter a valid URL."), z.literal("")])
      .optional(),
    categoryId: z.string().optional(),
    tagIds: z.array(z.string()).default([]),
    content: z.string().trim().min(1, "Write something before saving."),
    status: z.enum(ARTICLE_FORM_STATUSES).optional(),
    scheduledAt: z.string().optional(),
  })
  .refine((data) => data.status !== "SCHEDULED" || Boolean(data.scheduledAt), {
    message: "Pick a date and time to schedule this article.",
    path: ["scheduledAt"],
  });

export type ArticleFormInput = z.infer<typeof articleFormSchema>;

import { z } from "zod";
import { articleBlockSchema } from "@/lib/validation/article-block";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Lenient — used for autosave. Only structural correctness matters here. */
export const draftSaveSchema = z.object({
  title: z.string().max(200),
  subtitle: z.string().max(300).optional(),
  slug: z
    .string()
    .max(220)
    .regex(slugPattern, "Use lowercase letters, numbers, and hyphens only.")
    .optional(),
  blocks: z.array(articleBlockSchema),
});

export type DraftSaveInput = z.infer<typeof draftSaveSchema>;

/** Strict — checked before DRAFT -> IN_REVIEW and before publishing. */
export const submitForReviewSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters."),
  blocks: z
    .array(articleBlockSchema)
    .min(1, "Add at least one block before submitting."),
});

export const seoSettingsSchema = z.object({
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
  ogImage: z.union([z.url("Enter a valid URL."), z.literal("")]).optional(),
  canonicalUrl: z
    .union([z.url("Enter a valid URL."), z.literal("")])
    .optional(),
});

export const publishSettingsSchema = z
  .object({
    featuredImage: z.union([z.url("Enter a valid URL."), z.literal("")]),
    categoryId: z.string().optional(),
    tagIds: z.array(z.string()).default([]),
    mode: z.enum(["now", "schedule"]),
    scheduledAt: z.string().optional(),
    seo: seoSettingsSchema.optional(),
  })
  .refine((data) => data.mode !== "schedule" || Boolean(data.scheduledAt), {
    message: "Pick a date and time to schedule this article.",
    path: ["scheduledAt"],
  })
  .refine((data) => Boolean(data.featuredImage), {
    message: "A featured image is required to publish.",
    path: ["featuredImage"],
  })
  .refine((data) => Boolean(data.categoryId), {
    message: "Choose a category to publish.",
    path: ["categoryId"],
  });

export type PublishSettingsInput = z.infer<typeof publishSettingsSchema>;

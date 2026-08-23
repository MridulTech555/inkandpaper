import { z } from "zod";

/**
 * Accepts a full URL ("https://…") or a site-relative path ("/uploads/…",
 * what the media upload/picker produce) — or an empty string, for "no
 * avatar set". A bare `z.url()` rejects relative paths, which broke saving
 * an avatar right after uploading or browsing to one.
 */
export const optionalImageUrlSchema = z
  .string()
  .optional()
  .refine(
    (value) =>
      !value || value === "" || value.startsWith("/") || z.url().safeParse(value).success,
    { message: "Enter a valid URL." },
  );

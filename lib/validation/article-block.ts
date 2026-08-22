import { z } from "zod";

const paragraphContent = z.object({ text: z.string() });
const headingContent = z.object({
  text: z.string(),
  level: z.number().int().min(2).max(4),
});
const imageContent = z.object({
  url: z.string(),
  alt: z.string().optional(),
  caption: z.string().optional(),
});
const galleryContent = z.object({
  images: z.array(z.object({ url: z.string(), alt: z.string().optional() })),
});
const videoContent = z.object({
  url: z.string(),
  caption: z.string().optional(),
});
const quoteContent = z.object({
  text: z.string(),
  attribution: z.string().optional(),
});
const codeContent = z.object({
  code: z.string(),
  language: z.string().optional(),
});
const tableContent = z.object({ rows: z.array(z.array(z.string())) });
const listContent = z.object({
  style: z.enum(["ordered", "unordered"]),
  items: z.array(z.string()),
});
const embedContent = z.object({
  url: z.string(),
  caption: z.string().optional(),
});
const calloutContent = z.object({
  text: z.string(),
  variant: z.enum(["default", "info", "success", "warning", "error"]),
});
const dividerContent = z.object({});

export const articleBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("PARAGRAPH"), content: paragraphContent }),
  z.object({ type: z.literal("HEADING"), content: headingContent }),
  z.object({ type: z.literal("IMAGE"), content: imageContent }),
  z.object({ type: z.literal("GALLERY"), content: galleryContent }),
  z.object({ type: z.literal("VIDEO"), content: videoContent }),
  z.object({ type: z.literal("QUOTE"), content: quoteContent }),
  z.object({ type: z.literal("CODE"), content: codeContent }),
  z.object({ type: z.literal("TABLE"), content: tableContent }),
  z.object({ type: z.literal("LIST"), content: listContent }),
  z.object({ type: z.literal("EMBED"), content: embedContent }),
  z.object({ type: z.literal("CALLOUT"), content: calloutContent }),
  z.object({ type: z.literal("DIVIDER"), content: dividerContent }),
]);

export type ArticleBlockInput = z.infer<typeof articleBlockSchema>;

export const DEFAULT_BLOCK_CONTENT: Record<ArticleBlockInput["type"], unknown> =
  {
    PARAGRAPH: { text: "" },
    HEADING: { text: "", level: 2 },
    IMAGE: { url: "", alt: "" },
    GALLERY: { images: [] },
    VIDEO: { url: "" },
    QUOTE: { text: "" },
    CODE: { code: "" },
    TABLE: {
      rows: [
        ["", ""],
        ["", ""],
      ],
    },
    LIST: { style: "unordered", items: [""] },
    EMBED: { url: "" },
    CALLOUT: { text: "", variant: "info" },
    DIVIDER: {},
  };

export const BLOCK_TYPE_LABELS: Record<ArticleBlockInput["type"], string> = {
  PARAGRAPH: "Paragraph",
  HEADING: "Heading",
  IMAGE: "Image",
  GALLERY: "Gallery",
  VIDEO: "Video",
  QUOTE: "Quote",
  CODE: "Code",
  TABLE: "Table",
  LIST: "List",
  EMBED: "Embed",
  CALLOUT: "Callout",
  DIVIDER: "Divider",
};

export const BLOCK_TYPES = Object.keys(
  BLOCK_TYPE_LABELS,
) as ArticleBlockInput["type"][];

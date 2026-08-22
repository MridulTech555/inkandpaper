import Image from "next/image";
import {
  blockHeadingLevel,
  blockText,
  slugifyHeading,
} from "@/lib/services/articles";
import {
  ArticleBody,
  ArticleHeading,
  ArticleQuote,
  Code,
} from "@/components/ui/typography";
import { Alert } from "@/components/ui/alert";

export interface ArticleContentBlock {
  id: string;
  type: string;
  position: number;
  content: unknown;
}

interface ImageContent {
  url?: unknown;
  alt?: unknown;
  caption?: unknown;
}
interface GalleryContent {
  images?: unknown;
}
interface TableContent {
  rows?: unknown;
}
interface ListContent {
  style?: unknown;
  items?: unknown;
}
interface CalloutContent {
  text?: unknown;
  variant?: unknown;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function ArticleContent({ blocks }: { blocks: ArticleContentBlock[] }) {
  return (
    <div className="flex flex-col gap-6">
      {blocks.map((block) => {
        switch (block.type) {
          case "HEADING": {
            const text = blockText(block.content);
            if (!text) return null;
            const level = blockHeadingLevel(block.content);
            return (
              <ArticleHeading
                key={block.id}
                id={slugifyHeading(text)}
                className={level >= 3 ? "text-xl" : undefined}
              >
                {text}
              </ArticleHeading>
            );
          }

          case "QUOTE": {
            const text = blockText(block.content);
            if (!text) return null;
            const attribution = asString(
              (block.content as { attribution?: unknown })?.attribution,
            );
            return (
              <figure key={block.id}>
                <ArticleQuote>{text}</ArticleQuote>
                {attribution ? (
                  <figcaption className="text-foreground-muted mt-2 text-sm">
                    &mdash; {attribution}
                  </figcaption>
                ) : null}
              </figure>
            );
          }

          case "CODE": {
            const code = asString((block.content as { code?: unknown })?.code);
            if (!code) return null;
            return (
              <pre
                key={block.id}
                className="bg-surface overflow-x-auto rounded-md p-4"
              >
                <Code className="bg-transparent p-0">{code}</Code>
              </pre>
            );
          }

          case "IMAGE": {
            const content = block.content as ImageContent;
            const url = asString(content?.url);
            if (!url) return null;
            const caption = asString(content?.caption);
            return (
              <figure key={block.id} className="flex flex-col gap-2">
                <div className="bg-surface relative aspect-[16/9] w-full overflow-hidden rounded-lg">
                  <Image
                    src={url}
                    alt={asString(content?.alt)}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                {caption ? (
                  <figcaption className="text-foreground-muted text-center text-sm">
                    {caption}
                  </figcaption>
                ) : null}
              </figure>
            );
          }

          case "GALLERY": {
            const content = block.content as GalleryContent;
            const images = Array.isArray(content?.images)
              ? (content.images as { url?: unknown; alt?: unknown }[])
              : [];
            const validImages = images.filter((image) => asString(image?.url));
            if (validImages.length === 0) return null;
            return (
              <div
                key={block.id}
                className="grid grid-cols-2 gap-3 sm:grid-cols-3"
              >
                {validImages.map((image, index) => (
                  <div
                    key={index}
                    className="bg-surface relative aspect-square overflow-hidden rounded-lg"
                  >
                    <Image
                      src={asString(image.url)}
                      alt={asString(image.alt)}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            );
          }

          case "VIDEO": {
            const url = asString((block.content as { url?: unknown })?.url);
            if (!url) return null;
            const caption = asString(
              (block.content as { caption?: unknown })?.caption,
            );
            return (
              <figure key={block.id} className="flex flex-col gap-2">
                <div className="bg-surface aspect-video w-full overflow-hidden rounded-lg">
                  <iframe
                    src={url}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                {caption ? (
                  <figcaption className="text-foreground-muted text-center text-sm">
                    {caption}
                  </figcaption>
                ) : null}
              </figure>
            );
          }

          case "EMBED": {
            const url = asString((block.content as { url?: unknown })?.url);
            if (!url) return null;
            const caption = asString(
              (block.content as { caption?: unknown })?.caption,
            );
            return (
              <figure key={block.id} className="flex flex-col gap-2">
                <div className="border-border aspect-video w-full overflow-hidden rounded-lg border">
                  <iframe src={url} className="h-full w-full" />
                </div>
                {caption ? (
                  <figcaption className="text-foreground-muted text-center text-sm">
                    {caption}
                  </figcaption>
                ) : null}
              </figure>
            );
          }

          case "TABLE": {
            const content = block.content as TableContent;
            const rows = Array.isArray(content?.rows)
              ? (content.rows as unknown[][])
              : [];
            if (rows.length === 0) return null;
            return (
              <div
                key={block.id}
                className="border-border overflow-x-auto rounded-lg border"
              >
                <table className="w-full border-collapse text-sm">
                  <tbody>
                    {rows.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className="border-border border-b last:border-0"
                      >
                        {(row as unknown[]).map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="border-border border-r px-3 py-2 last:border-0"
                          >
                            {asString(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          case "LIST": {
            const content = block.content as ListContent;
            const items = Array.isArray(content?.items)
              ? (content.items as unknown[])
                  .map((item) => asString(item))
                  .filter(Boolean)
              : [];
            if (items.length === 0) return null;
            const ListTag = content?.style === "ordered" ? "ol" : "ul";
            return (
              <ListTag
                key={block.id}
                className={
                  ListTag === "ol"
                    ? "text-foreground list-decimal space-y-1 pl-6 font-serif text-lg leading-relaxed"
                    : "text-foreground list-disc space-y-1 pl-6 font-serif text-lg leading-relaxed"
                }
              >
                {items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ListTag>
            );
          }

          case "CALLOUT": {
            const content = block.content as CalloutContent;
            const text = asString(content?.text);
            if (!text) return null;
            const variant = asString(content?.variant, "default") as
              "default" | "info" | "success" | "warning" | "error";
            return (
              <Alert key={block.id} variant={variant}>
                {text}
              </Alert>
            );
          }

          case "DIVIDER":
            return <hr key={block.id} className="border-border" />;

          default: {
            const text = blockText(block.content);
            if (!text) return null;
            return <ArticleBody key={block.id}>{text}</ArticleBody>;
          }
        }
      })}
    </div>
  );
}

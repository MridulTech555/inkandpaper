"use client";

import { ImageIcon, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MediaPickerDialog } from "@/components/author/media-picker-dialog";
import { cn } from "@/lib/utils/cn";
import type { ArticleBlockInput } from "@/lib/validation/article-block";

type ContentOf<T extends ArticleBlockInput["type"]> = Extract<
  ArticleBlockInput,
  { type: T }
>["content"];

interface FieldProps<T extends ArticleBlockInput["type"]> {
  content: ContentOf<T>;
  onChange: (content: ContentOf<T>) => void;
}

const fieldClass =
  "flex h-9 w-full rounded-md border border-border bg-transparent px-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function ParagraphFields({
  content,
  onChange,
}: FieldProps<"PARAGRAPH">) {
  return (
    <Textarea
      value={content.text}
      onChange={(event) => onChange({ text: event.target.value })}
      placeholder="Write a paragraph…"
      rows={3}
    />
  );
}

export function HeadingFields({ content, onChange }: FieldProps<"HEADING">) {
  return (
    <div className="flex gap-2">
      <Input
        value={content.text}
        onChange={(event) => onChange({ ...content, text: event.target.value })}
        placeholder="Heading text"
        className="flex-1"
      />
      <select
        value={content.level}
        onChange={(event) =>
          onChange({ ...content, level: Number(event.target.value) })
        }
        className={cn(fieldClass, "w-20")}
      >
        <option value={2}>H2</option>
        <option value={3}>H3</option>
        <option value={4}>H4</option>
      </select>
    </div>
  );
}

export function ImageFields({ content, onChange }: FieldProps<"IMAGE">) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          value={content.url}
          onChange={(event) =>
            onChange({ ...content, url: event.target.value })
          }
          placeholder="https://…"
          className="flex-1"
        />
        <MediaPickerDialog
          onSelect={(url) => onChange({ ...content, url })}
          trigger={
            <Button type="button" variant="outline" size="sm">
              <ImageIcon className="h-4 w-4" />
              Browse
            </Button>
          }
        />
      </div>
      <Input
        value={content.alt ?? ""}
        onChange={(event) => onChange({ ...content, alt: event.target.value })}
        placeholder="Alt text"
      />
    </div>
  );
}

export function GalleryFields({ content, onChange }: FieldProps<"GALLERY">) {
  function updateImage(index: number, url: string) {
    const images = [...content.images];
    images[index] = { ...images[index], url };
    onChange({ images });
  }

  function removeImage(index: number) {
    onChange({ images: content.images.filter((_, i) => i !== index) });
  }

  return (
    <div className="flex flex-col gap-2">
      {content.images.map((image, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={image.url}
            onChange={(event) => updateImage(index, event.target.value)}
            placeholder="https://…"
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeImage(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit"
        onClick={() => onChange({ images: [...content.images, { url: "" }] })}
      >
        <Plus className="h-4 w-4" />
        Add image
      </Button>
    </div>
  );
}

export function VideoFields({ content, onChange }: FieldProps<"VIDEO">) {
  return (
    <div className="flex flex-col gap-2">
      <Input
        value={content.url}
        onChange={(event) => onChange({ ...content, url: event.target.value })}
        placeholder="https://www.youtube.com/embed/…"
      />
      <Input
        value={content.caption ?? ""}
        onChange={(event) =>
          onChange({ ...content, caption: event.target.value })
        }
        placeholder="Caption (optional)"
      />
    </div>
  );
}

export function QuoteFields({ content, onChange }: FieldProps<"QUOTE">) {
  return (
    <div className="flex flex-col gap-2">
      <Textarea
        value={content.text}
        onChange={(event) => onChange({ ...content, text: event.target.value })}
        placeholder="Quote text"
        rows={2}
      />
      <Input
        value={content.attribution ?? ""}
        onChange={(event) =>
          onChange({ ...content, attribution: event.target.value })
        }
        placeholder="Attribution (optional)"
      />
    </div>
  );
}

export function CodeFields({ content, onChange }: FieldProps<"CODE">) {
  return (
    <div className="flex flex-col gap-2">
      <Input
        value={content.language ?? ""}
        onChange={(event) =>
          onChange({ ...content, language: event.target.value })
        }
        placeholder="Language (optional)"
        className="w-40"
      />
      <Textarea
        value={content.code}
        onChange={(event) => onChange({ ...content, code: event.target.value })}
        placeholder="Code…"
        rows={6}
        className="font-mono text-sm"
      />
    </div>
  );
}

export function TableFields({ content, onChange }: FieldProps<"TABLE">) {
  function updateCell(row: number, col: number, value: string) {
    const rows = content.rows.map((r) => [...r]);
    rows[row][col] = value;
    onChange({ rows });
  }

  function addRow() {
    const cols = content.rows[0]?.length ?? 2;
    onChange({ rows: [...content.rows, Array(cols).fill("")] });
  }

  function addColumn() {
    onChange({ rows: content.rows.map((r) => [...r, ""]) });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <tbody>
            {content.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, colIndex) => (
                  <td key={colIndex} className="border-border border p-1">
                    <input
                      value={cell}
                      onChange={(event) =>
                        updateCell(rowIndex, colIndex, event.target.value)
                      }
                      className="text-foreground w-full bg-transparent px-1.5 py-1 text-sm focus-visible:outline-none"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <Plus className="h-4 w-4" />
          Row
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={addColumn}>
          <Plus className="h-4 w-4" />
          Column
        </Button>
      </div>
    </div>
  );
}

export function ListFields({ content, onChange }: FieldProps<"LIST">) {
  function updateItem(index: number, value: string) {
    const items = [...content.items];
    items[index] = value;
    onChange({ ...content, items });
  }

  function removeItem(index: number) {
    onChange({
      ...content,
      items: content.items.filter((_, i) => i !== index),
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <select
        value={content.style}
        onChange={(event) =>
          onChange({
            ...content,
            style: event.target.value as "ordered" | "unordered",
          })
        }
        className={cn(fieldClass, "w-36")}
      >
        <option value="unordered">Bulleted</option>
        <option value="ordered">Numbered</option>
      </select>
      {content.items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={item}
            onChange={(event) => updateItem(index, event.target.value)}
            placeholder={`Item ${index + 1}`}
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeItem(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit"
        onClick={() => onChange({ ...content, items: [...content.items, ""] })}
      >
        <Plus className="h-4 w-4" />
        Add item
      </Button>
    </div>
  );
}

export function EmbedFields({ content, onChange }: FieldProps<"EMBED">) {
  return (
    <div className="flex flex-col gap-2">
      <Input
        value={content.url}
        onChange={(event) => onChange({ ...content, url: event.target.value })}
        placeholder="https://…"
      />
      <Input
        value={content.caption ?? ""}
        onChange={(event) =>
          onChange({ ...content, caption: event.target.value })
        }
        placeholder="Caption (optional)"
      />
    </div>
  );
}

export function CalloutFields({ content, onChange }: FieldProps<"CALLOUT">) {
  return (
    <div className="flex flex-col gap-2">
      <select
        value={content.variant}
        onChange={(event) =>
          onChange({
            ...content,
            variant: event.target.value as typeof content.variant,
          })
        }
        className={cn(fieldClass, "w-36")}
      >
        <option value="default">Default</option>
        <option value="info">Info</option>
        <option value="success">Success</option>
        <option value="warning">Warning</option>
        <option value="error">Error</option>
      </select>
      <Textarea
        value={content.text}
        onChange={(event) => onChange({ ...content, text: event.target.value })}
        placeholder="Callout text"
        rows={2}
      />
    </div>
  );
}

export function DividerFields() {
  return <hr className="border-border" />;
}

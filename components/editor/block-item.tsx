"use client";

import { ChevronDown, ChevronUp, GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import {
  BLOCK_TYPE_LABELS,
  type ArticleBlockInput,
} from "@/lib/validation/article-block";
import {
  CalloutFields,
  CodeFields,
  DividerFields,
  EmbedFields,
  GalleryFields,
  HeadingFields,
  ImageFields,
  ListFields,
  ParagraphFields,
  QuoteFields,
  TableFields,
  VideoFields,
} from "@/components/editor/block-fields";

export interface EditorBlock {
  clientId: string;
  type: ArticleBlockInput["type"];
  content: Record<string, unknown>;
}

interface BlockItemProps {
  block: EditorBlock;
  index: number;
  total: number;
  onChange: (content: Record<string, unknown>) => void;
  onMove: (direction: "up" | "down") => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragOver: () => void;
  onDrop: () => void;
  isDragging: boolean;
  isDropTarget: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FIELD_COMPONENTS: Record<string, any> = {
  PARAGRAPH: ParagraphFields,
  HEADING: HeadingFields,
  IMAGE: ImageFields,
  GALLERY: GalleryFields,
  VIDEO: VideoFields,
  QUOTE: QuoteFields,
  CODE: CodeFields,
  TABLE: TableFields,
  LIST: ListFields,
  EMBED: EmbedFields,
  CALLOUT: CalloutFields,
  DIVIDER: DividerFields,
};

export function BlockItem({
  block,
  index,
  total,
  onChange,
  onMove,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
  isDropTarget,
}: BlockItemProps) {
  const Fields = FIELD_COMPONENTS[block.type];

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={(event) => {
        event.preventDefault();
        onDragOver();
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDrop();
      }}
      className={cn(
        "group border-border bg-surface-elevated flex gap-2 rounded-lg border p-3 transition-colors",
        isDragging && "opacity-40",
        isDropTarget && "border-primary",
      )}
    >
      <div className="text-foreground-muted flex cursor-grab flex-col items-center gap-1 pt-1 active:cursor-grabbing">
        <GripVertical className="h-4 w-4" />
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-foreground-muted text-xs font-medium tracking-wide uppercase">
            {BLOCK_TYPE_LABELS[block.type]}
          </span>
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={index === 0}
              onClick={() => onMove("up")}
              aria-label="Move up"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={index === total - 1}
              onClick={() => onMove("down")}
              aria-label="Move down"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onDelete}
              aria-label="Delete block"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Fields content={block.content} onChange={onChange} />
      </div>
    </div>
  );
}

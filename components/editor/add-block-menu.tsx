"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BLOCK_TYPES,
  BLOCK_TYPE_LABELS,
  type ArticleBlockInput,
} from "@/lib/validation/article-block";

export function AddBlockMenu({
  onAdd,
}: {
  onAdd: (type: ArticleBlockInput["type"]) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-center border-dashed"
        >
          <Plus className="h-4 w-4" />
          Add block
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="grid grid-cols-2 gap-0.5">
        {BLOCK_TYPES.map((type) => (
          <DropdownMenuItem key={type} onSelect={() => onAdd(type)}>
            {BLOCK_TYPE_LABELS[type]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

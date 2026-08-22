"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/hooks/use-toast";
import { deleteMediaAction } from "@/lib/services/media-actions";

export interface MediaGridItem {
  id: string;
  url: string;
  filename: string;
  size: number;
  createdAt: Date;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaGrid({ media }: { media: MediaGridItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  function handleDelete() {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    startTransition(async () => {
      const result = await deleteMediaAction(id);
      if (result?.error) {
        toast({
          title: "Couldn't delete file",
          description: result.error,
          variant: "error",
        });
      } else {
        toast({ title: "File deleted" });
        router.refresh();
      }
      setPendingDeleteId(null);
    });
  }

  async function handleCopyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${url}`);
      toast({ title: "URL copied" });
    } catch {
      toast({ title: "Couldn't copy URL", variant: "error" });
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {media.map((item) => (
          <div
            key={item.id}
            className="border-border flex flex-col gap-2 rounded-lg border p-2"
          >
            <button
              type="button"
              onClick={() => handleCopyUrl(item.url)}
              className="bg-surface relative aspect-square overflow-hidden rounded-md"
              title="Copy URL"
            >
              <Image
                src={item.url}
                alt={item.filename}
                fill
                className="object-cover"
                sizes="200px"
              />
            </button>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-foreground truncate text-xs font-medium">
                  {item.filename}
                </p>
                <p className="text-foreground-muted text-xs">
                  {formatSize(item.size)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Delete"
                onClick={() => setPendingDeleteId(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
        title="Delete this file?"
        description="This permanently removes the file. Articles referencing it will show a broken image."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={isPending}
      />
    </>
  );
}

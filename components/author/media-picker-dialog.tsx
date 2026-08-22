"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";

interface MediaItem {
  id: string;
  url: string;
  filename: string;
}

export function MediaPickerDialog({
  onSelect,
  trigger,
}: {
  onSelect: (url: string) => void;
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState<MediaItem[] | null>(null);

  useEffect(() => {
    if (!open) return;
    fetch("/api/author/media")
      .then((response) => response.json())
      .then((data) => setMedia(data.media))
      .catch(() => setMedia([]));
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose an image</DialogTitle>
        </DialogHeader>

        {media === null ? (
          <p className="text-foreground-muted py-8 text-center text-sm">
            Loading…
          </p>
        ) : media.length === 0 ? (
          <EmptyState
            icon={ImageIcon}
            title="No media yet"
            description="Upload images from the Media page first."
          />
        ) : (
          <div className="grid max-h-96 grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
            {media.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelect(item.url);
                  setOpen(false);
                }}
                className="border-border focus-visible:ring-primary relative aspect-square overflow-hidden rounded-md border focus-visible:ring-2 focus-visible:outline-none"
              >
                <Image
                  src={item.url}
                  alt={item.filename}
                  fill
                  className="object-cover"
                  sizes="150px"
                />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

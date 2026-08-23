"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/typography";
import { toast } from "@/hooks/use-toast";
import { createTagAction, updateTagAction } from "@/lib/services/tag-actions";
import type { AdminTagListItem } from "@/lib/services/admin-tags";

export function TagFormDialog({
  tag,
  trigger,
}: {
  tag?: AdminTagListItem;
  trigger: ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(tag?.name ?? "");
  const [slug, setSlug] = useState(tag?.slug ?? "");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const payload = { name, slug };
      const result = tag
        ? await updateTagAction(tag.id, payload)
        : await createTagAction(payload);
      if (result.error) {
        setError(result.error);
        return;
      }
      toast({ title: tag ? "Tag updated" : "Tag created" });
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tag ? "Edit tag" : "New tag"}</DialogTitle>
          <DialogDescription>
            Tags help readers find related articles.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tag-name">Name</Label>
            <Input
              id="tag-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Design"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tag-slug">Slug (optional)</Label>
            <Input
              id="tag-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="design"
            />
          </div>
          {error ? <p className="text-error text-sm">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !name.trim()}>
            {isPending ? "Saving…" : tag ? "Save changes" : "Create tag"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

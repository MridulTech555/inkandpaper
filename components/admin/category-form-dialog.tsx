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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/typography";
import { toast } from "@/hooks/use-toast";
import {
  createCategoryAction,
  updateCategoryAction,
} from "@/lib/services/category-actions";
import type { AdminCategoryListItem } from "@/lib/services/admin-categories";

export function CategoryFormDialog({
  category,
  trigger,
}: {
  category?: AdminCategoryListItem;
  trigger: ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [categoryDescription, setCategoryDescription] = useState(
    category?.description ?? "",
  );
  const [image, setImage] = useState(category?.image ?? "");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const payload = {
        name,
        slug,
        description: categoryDescription ?? "",
        image: image ?? "",
      };
      const result = category
        ? await updateCategoryAction(category.id, payload)
        : await createCategoryAction(payload);
      if (result.error) {
        setError(result.error);
        return;
      }
      toast({ title: category ? "Category updated" : "Category created" });
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {category ? "Edit category" : "New category"}
          </DialogTitle>
          <DialogDescription>
            Categories group articles on the public site.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cat-name">Name</Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Technology"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cat-slug">Slug (optional)</Label>
            <Input
              id="cat-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="technology"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cat-categoryDescription">Description</Label>
            <Textarea
              id="cat-categoryDescription"
              value={categoryDescription}
              onChange={(e) => setCategoryDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cat-image">Image URL</Label>
            <Input
              id="cat-image"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://…"
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
            {isPending
              ? "Saving…"
              : category
                ? "Save changes"
                : "Create category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

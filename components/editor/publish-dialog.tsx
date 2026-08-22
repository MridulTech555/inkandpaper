"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/typography";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MediaPickerDialog } from "@/components/author/media-picker-dialog";
import { toast } from "@/hooks/use-toast";
import { publishArticleAction } from "@/lib/services/article-mutations";
import { cn } from "@/lib/utils/cn";

interface CategoryOption {
  id: string;
  name: string;
}
interface TagOption {
  id: string;
  name: string;
}

export interface PublishInitialValues {
  featuredImage: string;
  categoryId: string;
  tagIds: string[];
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  canonicalUrl: string;
}

const selectClass =
  "h-10 w-full rounded-md border border-border bg-transparent px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function PublishDialog({
  open,
  onOpenChange,
  articleId,
  initialValues,
  categories,
  tags,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleId: string;
  initialValues: PublishInitialValues;
  categories: CategoryOption[];
  tags: TagOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [featuredImage, setFeaturedImage] = useState(
    initialValues.featuredImage,
  );
  const [categoryId, setCategoryId] = useState(initialValues.categoryId);
  const [tagIds, setTagIds] = useState<string[]>(initialValues.tagIds);
  const [mode, setMode] = useState<"now" | "schedule">("now");
  const [scheduledAt, setScheduledAt] = useState("");
  const [metaTitle, setMetaTitle] = useState(initialValues.metaTitle);
  const [metaDescription, setMetaDescription] = useState(
    initialValues.metaDescription,
  );
  const [ogImage, setOgImage] = useState(initialValues.ogImage);
  const [canonicalUrl, setCanonicalUrl] = useState(initialValues.canonicalUrl);

  function toggleTag(tagId: string) {
    setTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await publishArticleAction(articleId, {
        featuredImage,
        categoryId,
        tagIds,
        mode,
        scheduledAt: scheduledAt || undefined,
        seo: { metaTitle, metaDescription, ogImage, canonicalUrl },
      });
      if (result?.error) {
        setError(result.error);
        return;
      }
      toast({
        title: mode === "schedule" ? "Article scheduled" : "Article published",
      });
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Publish article</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="publish-featured-image">Featured image</Label>
            <div className="flex gap-2">
              <Input
                id="publish-featured-image"
                value={featuredImage}
                onChange={(event) => setFeaturedImage(event.target.value)}
                placeholder="https://…"
              />
              <MediaPickerDialog
                onSelect={setFeaturedImage}
                trigger={
                  <Button type="button" variant="outline" size="sm">
                    <ImageIcon className="h-4 w-4" />
                    Browse
                  </Button>
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="publish-category">Category</Label>
            <select
              id="publish-category"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className={selectClass}
            >
              <option value="">Choose a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {tags.length > 0 ? (
            <div className="flex flex-col gap-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-4">
                {tags.map((tag) => (
                  <label
                    key={tag.id}
                    className="text-foreground flex items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={tagIds.includes(tag.id)}
                      onCheckedChange={() => toggleTag(tag.id)}
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <Label>When</Label>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="publish-mode"
                  checked={mode === "now"}
                  onChange={() => setMode("now")}
                />
                Publish now
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="publish-mode"
                  checked={mode === "schedule"}
                  onChange={() => setMode("schedule")}
                />
                Schedule
              </label>
            </div>
            {mode === "schedule" ? (
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(event) => setScheduledAt(event.target.value)}
                className="w-fit"
              />
            ) : null}
          </div>

          <div className="border-border border-t pt-4">
            <button
              type="button"
              onClick={() => setAdvancedOpen((prev) => !prev)}
              className="text-foreground flex w-full items-center justify-between text-sm font-medium"
            >
              Advanced (SEO, social sharing, canonical URL)
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  advancedOpen && "rotate-180",
                )}
              />
            </button>

            {advancedOpen ? (
              <div className="mt-4 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="meta-title">Meta title</Label>
                  <Input
                    id="meta-title"
                    value={metaTitle}
                    onChange={(event) => setMetaTitle(event.target.value)}
                    maxLength={70}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="meta-description">Meta description</Label>
                  <Input
                    id="meta-description"
                    value={metaDescription}
                    onChange={(event) => setMetaDescription(event.target.value)}
                    maxLength={160}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="og-image">Social share image</Label>
                  <Input
                    id="og-image"
                    value={ogImage}
                    onChange={(event) => setOgImage(event.target.value)}
                    placeholder="https://…"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="canonical-url">Canonical URL</Label>
                  <Input
                    id="canonical-url"
                    value={canonicalUrl}
                    onChange={(event) => setCanonicalUrl(event.target.value)}
                    placeholder="https://…"
                  />
                </div>
              </div>
            ) : null}
          </div>

          {error ? <p className="text-error text-sm">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isPending}>
            {isPending
              ? "Publishing…"
              : mode === "schedule"
                ? "Schedule"
                : "Publish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

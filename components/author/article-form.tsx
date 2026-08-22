"use client";

import { useActionState, useState } from "react";
import { ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/typography";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { MediaPickerDialog } from "@/components/author/media-picker-dialog";
import { ArticleStatusBadge } from "@/components/author/article-status-badge";
import { ARTICLE_FORM_STATUSES } from "@/lib/validation/article";
import {
  createArticleAction,
  updateArticleAction,
  type ArticleFormState,
} from "@/lib/services/article-mutations";
import type { ArticleStatus } from "@prisma/client";

interface CategoryOption {
  id: string;
  name: string;
}

interface TagOption {
  id: string;
  name: string;
}

export interface ArticleFormValues {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  categoryId: string;
  tagIds: string[];
  content: string;
  status: string;
  scheduledAt: string;
}

const initialState: ArticleFormState = {};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ArticleForm({
  mode,
  values,
  categories,
  tags,
  canPublish,
}: {
  mode: "create" | "edit";
  values: ArticleFormValues;
  categories: CategoryOption[];
  tags: TagOption[];
  canPublish: boolean;
}) {
  const action =
    mode === "edit"
      ? updateArticleAction.bind(null, values.id!)
      : createArticleAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  const [title, setTitle] = useState(values.title);
  const [slug, setSlug] = useState(values.slug);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [featuredImage, setFeaturedImage] = useState(values.featuredImage);
  const [status, setStatus] = useState(values.status);
  const isStatusEditable =
    mode === "create" ||
    (ARTICLE_FORM_STATUSES as readonly string[]).includes(values.status);

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            if (!slugTouched) setSlug(slugify(event.target.value));
          }}
          required
        />
        {state.fieldErrors?.title?.map((message) => (
          <p key={message} className="text-error text-xs">
            {message}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          name="slug"
          value={slug}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(event.target.value);
          }}
          required
        />
        {state.fieldErrors?.slug?.map((message) => (
          <p key={message} className="text-error text-xs">
            {message}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea
          id="excerpt"
          name="excerpt"
          defaultValue={values.excerpt}
          rows={2}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="featuredImage">Featured image URL</Label>
        <div className="flex gap-2">
          <Input
            id="featuredImage"
            name="featuredImage"
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
        {state.fieldErrors?.featuredImage?.map((message) => (
          <p key={message} className="text-error text-xs">
            {message}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="categoryId">Category</Label>
        <select
          id="categoryId"
          name="categoryId"
          defaultValue={values.categoryId}
          className="border-border text-foreground focus-visible:ring-primary h-10 rounded-md border bg-transparent px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
        >
          <option value="">No category</option>
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
                  name="tagIds"
                  value={tag.id}
                  defaultChecked={values.tagIds.includes(tag.id)}
                />
                {tag.name}
              </label>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="content">Content</Label>
        <p className="text-foreground-muted text-xs">
          Separate paragraphs with a blank line. Start a line with{" "}
          <code className="bg-surface rounded px-1">## </code> for a heading, or{" "}
          <code className="bg-surface rounded px-1">&gt; </code> for a quote.
        </p>
        <Textarea
          id="content"
          name="content"
          defaultValue={values.content}
          rows={16}
          required
        />
        {state.fieldErrors?.content?.map((message) => (
          <p key={message} className="text-error text-xs">
            {message}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="status">Status</Label>
        {isStatusEditable ? (
          <select
            id="status"
            name="status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="border-border text-foreground focus-visible:ring-primary h-10 w-fit rounded-md border bg-transparent px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
          >
            <option value="DRAFT">Save as draft</option>
            <option value="IN_REVIEW">Submit for review</option>
            {canPublish ? <option value="SCHEDULED">Schedule</option> : null}
            {canPublish ? <option value="PUBLISHED">Publish now</option> : null}
          </select>
        ) : (
          <div className="flex items-center gap-2">
            <ArticleStatusBadge status={status as ArticleStatus} />
            <p className="text-foreground-muted text-xs">
              This status is set by the review workflow and can&apos;t be
              changed here.
            </p>
          </div>
        )}
      </div>

      {isStatusEditable && status === "SCHEDULED" ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="scheduledAt">Scheduled for</Label>
          <Input
            id="scheduledAt"
            name="scheduledAt"
            type="datetime-local"
            defaultValue={values.scheduledAt}
            className="w-fit"
          />
          {state.fieldErrors?.scheduledAt?.map((message) => (
            <p key={message} className="text-error text-xs">
              {message}
            </p>
          ))}
        </div>
      ) : null}

      {state.error ? <p className="text-error text-sm">{state.error}</p> : null}

      <div>
        <Button type="submit" disabled={pending}>
          {pending
            ? "Saving…"
            : mode === "create"
              ? "Create article"
              : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

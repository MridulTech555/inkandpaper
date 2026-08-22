"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { ArticleStatusBadge } from "@/components/author/article-status-badge";
import { AddBlockMenu } from "@/components/editor/add-block-menu";
import { BlockItem, type EditorBlock } from "@/components/editor/block-item";
import { SaveStatus, type SaveState } from "@/components/editor/save-status";
import {
  PublishDialog,
  type PublishInitialValues,
} from "@/components/editor/publish-dialog";
import {
  saveArticleContentAction,
  submitForReviewAction,
} from "@/lib/services/article-mutations";
import {
  DEFAULT_BLOCK_CONTENT,
  type ArticleBlockInput,
} from "@/lib/validation/article-block";
import type { ArticleStatus } from "@prisma/client";

const AUTOSAVE_DELAY_MS = 1500;

function makeClientId() {
  return Math.random().toString(36).slice(2);
}

export interface ArticleEditorInitialData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: ArticleStatus;
  blocks: {
    type: ArticleBlockInput["type"];
    content: Record<string, unknown>;
  }[];
  publishInitialValues: PublishInitialValues;
}

interface ArticleEditorProps {
  article: ArticleEditorInitialData;
  categories: { id: string; name: string }[];
  tags: { id: string; name: string }[];
  canPublish: boolean;
}

const CONTENT_EDITABLE_STATUSES: ArticleStatus[] = [
  "DRAFT",
  "CHANGES_REQUESTED",
  "PUBLISHED",
];

interface DraftBackup {
  title: string;
  subtitle: string;
  slug: string;
  blocks: EditorBlock[];
  backedUpAt: string;
}

export function ArticleEditor({
  article,
  categories,
  tags,
  canPublish,
}: ArticleEditorProps) {
  const router = useRouter();
  const storageKey = `inkpaper:draft:${article.id}`;
  const isEditable = CONTENT_EDITABLE_STATUSES.includes(article.status);

  const [title, setTitle] = useState(article.title);
  const [subtitle, setSubtitle] = useState(article.excerpt);
  const [slug, setSlug] = useState(article.slug);
  const [blocks, setBlocks] = useState<EditorBlock[]>(
    article.blocks.map((block) => ({
      clientId: makeClientId(),
      type: block.type,
      content: block.content,
    })),
  );
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [restoreBanner, setRestoreBanner] = useState<DraftBackup | null>(null);

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const hasMounted = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDirtyRef = useRef(false);

  // Offer to restore a local backup left by a previous, unsaved session.
  // localStorage only exists on the client, so this has to run in an
  // effect rather than a lazy useState initializer (which also runs
  // during the server render pass and would throw/mismatch).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot hydration from a browser-only API, not derivable at render time.
      if (raw) setRestoreBanner(JSON.parse(raw));
    } catch {
      // Corrupt or inaccessible storage — ignore, nothing to restore.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Back up to localStorage on every change so content survives a crash or
  // an autosave that hasn't landed yet.
  useEffect(() => {
    if (!hasMounted.current) return;
    try {
      const backup: DraftBackup = {
        title,
        subtitle,
        slug,
        blocks,
        backedUpAt: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(backup));
    } catch {
      // Best-effort only.
    }
  }, [title, subtitle, slug, blocks, storageKey]);

  // Debounced autosave. Marking the editor "dirty" happens at the point of
  // each edit (see markDirty, called from every mutator below) rather than
  // here, so this effect only ever calls setState from the async callback.
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    if (!isEditable) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaveState("saving");
      const result = await saveArticleContentAction(article.id, {
        title,
        subtitle,
        slug,
        blocks: blocks.map(
          ({ type, content }) => ({ type, content }) as ArticleBlockInput,
        ),
      });
      if (result.error) {
        setSaveState("error");
        toast({
          title: "Couldn't save",
          description: result.error,
          variant: "error",
        });
        return;
      }
      isDirtyRef.current = false;
      setSaveState("saved");
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // Best-effort only.
      }
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, subtitle, slug, blocks]);

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (isDirtyRef.current) {
        event.preventDefault();
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  function markDirty() {
    isDirtyRef.current = true;
    setSaveState("dirty");
  }

  function restoreBackup() {
    if (!restoreBanner) return;
    setTitle(restoreBanner.title);
    setSubtitle(restoreBanner.subtitle);
    setSlug(restoreBanner.slug);
    setBlocks(restoreBanner.blocks);
    setRestoreBanner(null);
  }

  function discardBackup() {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Best-effort only.
    }
    setRestoreBanner(null);
  }

  function addBlock(type: ArticleBlockInput["type"]) {
    markDirty();
    setBlocks((prev) => [
      ...prev,
      {
        clientId: makeClientId(),
        type,
        content: {
          ...(DEFAULT_BLOCK_CONTENT[type] as Record<string, unknown>),
        },
      },
    ]);
  }

  function updateBlock(index: number, content: Record<string, unknown>) {
    markDirty();
    setBlocks((prev) =>
      prev.map((block, i) => (i === index ? { ...block, content } : block)),
    );
  }

  function deleteBlock(index: number) {
    markDirty();
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  }

  function moveBlock(index: number, direction: "up" | "down") {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= blocks.length) return;
    markDirty();
    setBlocks((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function reorderBlocks(from: number, to: number) {
    if (from === to) return;
    markDirty();
    setBlocks((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  async function handleSubmitForReview() {
    setIsSubmittingReview(true);
    const result = await submitForReviewAction(article.id);
    setIsSubmittingReview(false);
    if (result?.error) {
      toast({
        title: "Couldn't submit for review",
        description: result.error,
        variant: "error",
      });
      return;
    }
    toast({ title: "Submitted for review" });
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6">
      <header className="flex items-center justify-between gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/author/articles">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>

        <div className="flex items-center gap-3">
          <SaveStatus state={saveState} />
          <ArticleStatusBadge status={article.status} />
          <Button asChild variant="outline" size="sm">
            <Link
              href={`/author/articles/${article.id}/preview`}
              target="_blank"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Link>
          </Button>
          {article.status === "DRAFT" ||
          article.status === "CHANGES_REQUESTED" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSubmitForReview}
              disabled={isSubmittingReview}
            >
              <Send className="h-4 w-4" />
              {isSubmittingReview ? "Submitting…" : "Submit for review"}
            </Button>
          ) : null}
          {canPublish ? (
            <Button size="sm" onClick={() => setPublishDialogOpen(true)}>
              {article.status === "PUBLISHED"
                ? "Update publish settings"
                : "Publish"}
            </Button>
          ) : null}
        </div>
      </header>

      {restoreBanner ? (
        <Alert title="Unsaved changes found">
          <div className="flex items-center justify-between gap-4">
            <span>
              We found changes from a previous session that weren&apos;t saved.
            </span>
            <div className="flex shrink-0 gap-2">
              <Button size="sm" variant="outline" onClick={discardBackup}>
                Discard
              </Button>
              <Button size="sm" onClick={restoreBackup}>
                Restore
              </Button>
            </div>
          </div>
        </Alert>
      ) : null}

      {!isEditable ? (
        <Alert variant="warning" title="Read-only">
          This article is {article.status.toLowerCase().replace("_", " ")} and
          can&apos;t be edited right now.
        </Alert>
      ) : null}

      <div className="flex flex-col gap-3">
        <Textarea
          value={title}
          onChange={(event) => {
            markDirty();
            setTitle(event.target.value);
          }}
          placeholder="Title"
          disabled={!isEditable}
          rows={1}
          className="text-foreground resize-none border-none bg-transparent px-0 text-4xl font-bold tracking-tight shadow-none focus-visible:ring-0"
        />
        <Textarea
          value={subtitle}
          onChange={(event) => {
            markDirty();
            setSubtitle(event.target.value);
          }}
          placeholder="Subtitle (optional)"
          disabled={!isEditable}
          rows={1}
          className="text-foreground-secondary resize-none border-none bg-transparent px-0 text-lg shadow-none focus-visible:ring-0"
        />
        <input
          value={slug}
          onChange={(event) => {
            markDirty();
            setSlug(event.target.value);
          }}
          disabled={!isEditable}
          className="text-foreground-muted w-fit border-none bg-transparent px-0 text-sm focus-visible:outline-none"
          aria-label="Slug"
        />
      </div>

      <div className="flex flex-col gap-3">
        {blocks.map((block, index) => (
          <BlockItem
            key={block.clientId}
            block={block}
            index={index}
            total={blocks.length}
            onChange={(content) => updateBlock(index, content)}
            onMove={(direction) => moveBlock(index, direction)}
            onDelete={() => deleteBlock(index)}
            onDragStart={() => setDragIndex(index)}
            onDragOver={() => setDropIndex(index)}
            onDrop={() => {
              if (dragIndex !== null && dropIndex !== null)
                reorderBlocks(dragIndex, dropIndex);
              setDragIndex(null);
              setDropIndex(null);
            }}
            isDragging={dragIndex === index}
            isDropTarget={dropIndex === index && dragIndex !== index}
          />
        ))}

        {isEditable ? <AddBlockMenu onAdd={addBlock} /> : null}
      </div>

      <PublishDialog
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        articleId={article.id}
        initialValues={article.publishInitialValues}
        categories={categories}
        tags={tags}
      />
    </div>
  );
}

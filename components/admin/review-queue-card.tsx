"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Eye, MessageSquareWarning, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/hooks/use-toast";
import {
  approveArticleAction,
  rejectArticleAction,
  requestChangesArticleAction,
} from "@/lib/services/review-actions";
import type { ReviewQueueItem } from "@/lib/services/review-queue";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function ReviewQueueCard({ article }: { article: ReviewQueueItem }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [changesOpen, setChangesOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);

  function handleApprove() {
    startTransition(async () => {
      const result = await approveArticleAction(article.id);
      if (result?.error) {
        toast({
          title: "Couldn't approve article",
          description: result.error,
          variant: "error",
        });
        return;
      }
      toast({ title: "Article approved" });
      router.refresh();
    });
  }

  function handleRequestChanges() {
    startTransition(async () => {
      const result = await requestChangesArticleAction(article.id, feedback);
      if (result?.error) {
        toast({
          title: "Couldn't request changes",
          description: result.error,
          variant: "error",
        });
        return;
      }
      toast({ title: "Changes requested" });
      setChangesOpen(false);
      setFeedback("");
      router.refresh();
    });
  }

  function handleReject() {
    startTransition(async () => {
      const result = await rejectArticleAction(article.id, feedback);
      if (result?.error) {
        toast({
          title: "Couldn't reject article",
          description: result.error,
          variant: "error",
        });
        return;
      }
      toast({ title: "Article rejected" });
      setRejectOpen(false);
      setFeedback("");
      router.refresh();
    });
  }

  return (
    <div className="border-border bg-surface-elevated flex flex-col gap-3 rounded-lg border p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Link
            href={`/author/articles/${article.id}/preview`}
            className="text-foreground hover:text-primary text-base font-semibold"
          >
            {article.title}
          </Link>
          <p className="text-foreground-muted text-sm">
            {article.author.name}
            {article.category ? ` · ${article.category.name}` : ""} ·{" "}
            {article._count.blocks} block
            {article._count.blocks === 1 ? "" : "s"}
          </p>
          {article.excerpt ? (
            <p className="text-foreground-secondary text-sm">
              {article.excerpt}
            </p>
          ) : null}
        </div>
        <Badge variant="info">Submitted {formatDate(article.updatedAt)}</Badge>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/author/articles/${article.id}/preview`}>
            <Eye className="h-4 w-4" />
            Preview
          </Link>
        </Button>
        <Button size="sm" disabled={isPending} onClick={handleApprove}>
          <Check className="h-4 w-4" />
          Approve
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => setChangesOpen(true)}
        >
          <MessageSquareWarning className="h-4 w-4" />
          Request changes
        </Button>
        <Button
          variant="destructive"
          size="sm"
          disabled={isPending}
          onClick={() => setRejectOpen(true)}
        >
          <X className="h-4 w-4" />
          Reject
        </Button>
      </div>

      <Dialog open={changesOpen} onOpenChange={setChangesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request changes</DialogTitle>
            <DialogDescription>
              Tell {article.author.name} what needs to change before this can be
              approved.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="e.g. Add a featured image and tighten the intro paragraph."
            rows={4}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setChangesOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleRequestChanges} disabled={isPending}>
              {isPending ? "Sending…" : "Send feedback"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title="Reject this article?"
        description="The author will see this article marked as rejected."
        confirmLabel="Reject"
        onConfirm={handleReject}
        loading={isPending}
      />
    </div>
  );
}

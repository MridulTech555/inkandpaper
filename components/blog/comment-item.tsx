"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/hooks/use-toast";
import {
  deleteOwnCommentAction,
  reportCommentAction,
  updateCommentAction,
} from "@/lib/services/comment-mutations";
import type { CommentEntry } from "@/components/blog/comments-list";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function CommentItem({
  comment,
  articlePath,
  currentUserId,
}: {
  comment: CommentEntry;
  articlePath: string;
  currentUserId: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isOwn = currentUserId === comment.userId;
  const isReported = comment.status === "REPORTED";

  function handleSaveEdit() {
    startTransition(async () => {
      const result = await updateCommentAction(comment.id, articlePath, draft);
      if (result.error) {
        toast({
          title: "Couldn't update comment",
          description: result.error,
          variant: "error",
        });
        return;
      }
      setIsEditing(false);
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteOwnCommentAction(comment.id, articlePath);
      if (result.error) {
        toast({
          title: "Couldn't delete comment",
          description: result.error,
          variant: "error",
        });
        setDeleteOpen(false);
        return;
      }
      setDeleteOpen(false);
      router.refresh();
    });
  }

  function handleReport() {
    startTransition(async () => {
      const result = await reportCommentAction(comment.id, articlePath);
      if (result.error) {
        toast({
          title: "Couldn't report comment",
          description: result.error,
          variant: "error",
        });
        return;
      }
      toast({ title: "Comment reported for review" });
      router.refresh();
    });
  }

  return (
    <li className="flex gap-3">
      <Avatar fallback={comment.user.name.charAt(0)} size="sm" />
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-baseline gap-2">
          <p className="text-foreground text-sm font-medium">
            {comment.user.name}
          </p>
          <time
            dateTime={comment.createdAt.toISOString()}
            className="text-foreground-muted text-xs"
          >
            {formatDate(comment.createdAt)}
          </time>
          {isReported ? <Badge variant="warning">Reported</Badge> : null}
        </div>

        {isEditing ? (
          <div className="flex flex-col gap-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveEdit} disabled={isPending}>
                {isPending ? "Saving…" : "Save"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setDraft(comment.content);
                  setIsEditing(false);
                }}
                disabled={isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-foreground-secondary text-sm">{comment.content}</p>
        )}
      </div>

      {currentUserId && !isEditing ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Comment actions"
              className="h-7 w-7 shrink-0"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isOwn ? (
              <>
                <DropdownMenuItem onSelect={() => setIsEditing(true)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => setDeleteOpen(true)}
                  className="text-error"
                >
                  Delete
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem onSelect={handleReport} disabled={isReported}>
                {isReported ? "Reported" : "Report"}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this comment?"
        description="This can't be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={isPending}
      />
    </li>
  );
}

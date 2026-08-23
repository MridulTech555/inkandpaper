"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, EyeOff, Flag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/hooks/use-toast";
import {
  deleteCommentAction,
  setCommentStatusAction,
} from "@/lib/services/comment-actions";
import type { CommentStatus } from "@prisma/client";

export function CommentRowActions({
  commentId,
  status,
}: {
  commentId: string;
  status: CommentStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  function setStatus(next: "VISIBLE" | "HIDDEN" | "REPORTED") {
    startTransition(async () => {
      const result = await setCommentStatusAction(commentId, next);
      if (result.error) {
        toast({
          title: "Something went wrong",
          description: result.error,
          variant: "error",
        });
        return;
      }
      toast({ title: "Comment updated" });
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteCommentAction(commentId);
      if (result.error) {
        toast({
          title: "Couldn't delete",
          description: result.error,
          variant: "error",
        });
        setDeleteOpen(false);
        return;
      }
      toast({ title: "Comment deleted" });
      setDeleteOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="flex justify-end gap-1">
      {status !== "VISIBLE" ? (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Approve"
          disabled={isPending}
          onClick={() => setStatus("VISIBLE")}
        >
          <Check className="h-4 w-4" />
        </Button>
      ) : null}
      {status !== "HIDDEN" ? (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Hide"
          disabled={isPending}
          onClick={() => setStatus("HIDDEN")}
        >
          <EyeOff className="h-4 w-4" />
        </Button>
      ) : null}
      {status !== "REPORTED" ? (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Mark reported"
          disabled={isPending}
          onClick={() => setStatus("REPORTED")}
        >
          <Flag className="h-4 w-4" />
        </Button>
      ) : null}
      <Button
        variant="ghost"
        size="icon"
        aria-label="Delete"
        disabled={isPending}
        onClick={() => setDeleteOpen(true)}
      >
        <Trash2 className="text-error h-4 w-4" />
      </Button>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this comment?"
        description="This can't be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={isPending}
      />
    </div>
  );
}

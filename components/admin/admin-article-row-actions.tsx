"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/hooks/use-toast";
import {
  archiveArticleAction,
  deleteArticleAction,
} from "@/lib/services/article-mutations";
import { approveArticleAction } from "@/lib/services/review-actions";

export function AdminArticleRowActions({
  articleId,
  slug,
  status,
}: {
  articleId: string;
  slug: string;
  status: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmAction, setConfirmAction] = useState<
    "archive" | "delete" | null
  >(null);

  function handleApprove() {
    startTransition(async () => {
      const result = await approveArticleAction(articleId);
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

  function handleConfirm() {
    if (!confirmAction) return;
    startTransition(async () => {
      const action =
        confirmAction === "archive"
          ? archiveArticleAction
          : deleteArticleAction;
      const result = await action(articleId);
      if (result?.error) {
        toast({
          title: "Something went wrong",
          description: result.error,
          variant: "error",
        });
      } else {
        toast({
          title:
            confirmAction === "archive"
              ? "Article archived"
              : "Article deleted",
        });
        router.refresh();
      }
      setConfirmAction(null);
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Article actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {status === "PUBLISHED" ? (
            <DropdownMenuItem asChild>
              <Link href={`/article/${slug}`}>View</Link>
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem asChild>
            <Link href={`/author/articles/${articleId}/edit`}>Edit</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/author/articles/${articleId}/preview`}>Preview</Link>
          </DropdownMenuItem>
          {status === "IN_REVIEW" ? (
            <DropdownMenuItem onSelect={handleApprove} disabled={isPending}>
              Approve
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator />
          {status !== "ARCHIVED" ? (
            <DropdownMenuItem
              onSelect={() => setConfirmAction("archive")}
              disabled={isPending}
            >
              Archive
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            onSelect={() => setConfirmAction("delete")}
            disabled={isPending}
            className="text-error"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmAction !== null}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={
          confirmAction === "archive"
            ? "Archive this article?"
            : "Delete this article?"
        }
        description={
          confirmAction === "archive"
            ? "Archived articles are hidden from readers but not deleted."
            : "This permanently deletes the article and its comments. This can't be undone."
        }
        confirmLabel={confirmAction === "archive" ? "Archive" : "Delete"}
        confirmVariant={
          confirmAction === "archive" ? "secondary" : "destructive"
        }
        onConfirm={handleConfirm}
        loading={isPending}
      />
    </>
  );
}

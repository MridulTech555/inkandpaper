"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { createCommentAction } from "@/lib/services/comment-mutations";

export function CommentForm({
  articleId,
  articlePath,
  currentUser,
}: {
  articleId: string;
  articlePath: string;
  currentUser: { name: string; avatarUrl: string | null } | null;
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!currentUser) {
    return (
      <p className="border-border bg-surface text-foreground-secondary rounded-lg border p-4 text-sm">
        <Link href="/auth/login" className="text-primary hover:underline">
          Log in
        </Link>{" "}
        to join the conversation.
      </p>
    );
  }

  function handleSubmit() {
    if (!content.trim()) return;
    startTransition(async () => {
      const result = await createCommentAction(articleId, articlePath, content);
      if (result.error) {
        toast({
          title: "Couldn't post comment",
          description: result.error,
          variant: "error",
        });
        return;
      }
      setContent("");
      router.refresh();
    });
  }

  return (
    <div className="flex gap-3">
      <Avatar
        fallback={currentUser.name.charAt(0)}
        src={currentUser.avatarUrl ?? undefined}
        size="sm"
      />
      <div className="flex flex-1 flex-col gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts…"
          rows={3}
        />
        <div>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isPending || !content.trim()}
          >
            {isPending ? "Posting…" : "Post comment"}
          </Button>
        </div>
      </div>
    </div>
  );
}

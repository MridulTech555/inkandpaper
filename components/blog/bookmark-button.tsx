"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { toggleBookmarkAction } from "@/lib/services/bookmark-actions";
import { cn } from "@/lib/utils/cn";

export function BookmarkButton({
  articleId,
  articlePath,
  initialBookmarked,
}: {
  articleId: string;
  articlePath: string;
  initialBookmarked: boolean;
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await toggleBookmarkAction(articleId, articlePath);
      if (result.error) {
        toast({
          title: "Couldn't bookmark this article",
          description: result.error,
          variant: "error",
        });
        return;
      }
      setBookmarked(result.bookmarked);
    });
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={bookmarked}
    >
      <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} />
      {bookmarked ? "Bookmarked" : "Bookmark"}
    </Button>
  );
}

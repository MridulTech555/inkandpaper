"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { toggleLikeAction } from "@/lib/services/like-actions";
import { cn } from "@/lib/utils/cn";

export function LikeButton({
  articleId,
  articlePath,
  initialLiked,
  initialCount,
}: {
  articleId: string;
  articlePath: string;
  initialLiked: boolean;
  initialCount: number;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await toggleLikeAction(articleId, articlePath);
      if (result.error) {
        toast({
          title: "Couldn't like this article",
          description: result.error,
          variant: "error",
        });
        return;
      }
      setLiked(result.liked);
      setCount(result.count);
    });
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={liked}
    >
      <Heart className={cn("h-4 w-4", liked && "text-error fill-current")} />
      {count > 0 ? count : "Like"}
    </Button>
  );
}

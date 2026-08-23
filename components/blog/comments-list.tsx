import { EmptyState } from "@/components/ui/empty-state";
import { MessageSquare } from "lucide-react";
import { CommentItem } from "@/components/blog/comment-item";
import type { CommentStatus } from "@prisma/client";

export interface CommentEntry {
  id: string;
  content: string;
  createdAt: Date;
  userId: string;
  status: CommentStatus;
  user: { name: string; avatarUrl: string | null };
}

export function CommentsList({
  comments,
  articlePath,
  currentUserId,
}: {
  comments: CommentEntry[];
  articlePath: string;
  currentUserId: string | null;
}) {
  if (comments.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No comments yet"
        description="Be the first to share your thoughts on this article."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-6">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          articlePath={articlePath}
          currentUserId={currentUserId}
        />
      ))}
    </ul>
  );
}

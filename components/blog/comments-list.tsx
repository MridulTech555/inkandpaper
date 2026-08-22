import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { MessageSquare } from "lucide-react";

export interface CommentEntry {
  id: string;
  content: string;
  createdAt: Date;
  user: { name: string };
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function CommentsList({ comments }: { comments: CommentEntry[] }) {
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
        <li key={comment.id} className="flex gap-3">
          <Avatar fallback={comment.user.name.charAt(0)} size="sm" />
          <div className="flex flex-col gap-1">
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
            </div>
            <p className="text-foreground-secondary text-sm">
              {comment.content}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

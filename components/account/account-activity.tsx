import Link from "next/link";
import { Bookmark, Heart, MessageSquare } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { H2 } from "@/components/ui/typography";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export interface RecentComment {
  id: string;
  content: string;
  createdAt: Date;
  article: { title: string; slug: string };
}

export interface RecentLike {
  id: string;
  createdAt: Date;
  article: { title: string; slug: string };
}

export function AccountActivity({
  counts,
  recentComments,
  recentLikes,
}: {
  counts: { comments: number; likes: number; bookmarks: number };
  recentComments: RecentComment[];
  recentLikes: RecentLike[];
}) {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Comments" value={counts.comments} icon={MessageSquare} />
        <StatCard label="Likes" value={counts.likes} icon={Heart} />
        <Link href="/bookmarks" className="block">
          <StatCard label="Bookmarks" value={counts.bookmarks} icon={Bookmark} />
        </Link>
      </div>

      <section className="flex flex-col gap-3">
        <H2 className="text-lg">Recent comments</H2>
        {recentComments.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No comments yet"
            description="Comments you leave on articles will show up here."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {recentComments.map((comment) => (
              <li
                key={comment.id}
                className="border-border bg-surface-elevated flex flex-col gap-1 rounded-lg border p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <Link
                    href={`/article/${comment.article.slug}`}
                    className="text-foreground hover:text-primary text-sm font-medium"
                  >
                    {comment.article.title}
                  </Link>
                  <span className="text-foreground-muted text-xs">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-foreground-secondary text-sm">
                  {comment.content}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <H2 className="text-lg">Recently liked</H2>
        {recentLikes.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No likes yet"
            description="Articles you like will show up here."
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {recentLikes.map((like) => (
              <li
                key={like.id}
                className="border-border bg-surface-elevated flex items-center justify-between gap-2 rounded-lg border p-3"
              >
                <Link
                  href={`/article/${like.article.slug}`}
                  className="text-foreground hover:text-primary text-sm font-medium"
                >
                  {like.article.title}
                </Link>
                <span className="text-foreground-muted text-xs">
                  {formatDate(like.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

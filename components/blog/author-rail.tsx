import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { H2 } from "@/components/ui/typography";

export interface AuthorRailItem {
  slug: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  articleCount: number;
}

export function AuthorRail({ authors }: { authors: AuthorRailItem[] }) {
  return (
    <section className="flex flex-col gap-4">
      <H2 className="text-xl sm:text-2xl">Meet the writers</H2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {authors.map((author) => (
          <Link
            key={author.slug}
            href={`/author/${author.slug}`}
            className="group border-border bg-surface-elevated hover:border-primary flex items-start gap-3 rounded-lg border p-4 transition-colors"
          >
            <Avatar
              fallback={author.name.charAt(0)}
              src={author.avatarUrl ?? undefined}
              size="md"
            />
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-foreground group-hover:text-primary font-medium">
                {author.name}
              </span>
              <span className="text-foreground-muted text-xs">
                {author.articleCount}{" "}
                {author.articleCount === 1 ? "article" : "articles"}
              </span>
              {author.bio ? (
                <p className="text-foreground-secondary mt-1 line-clamp-2 text-sm">
                  {author.bio}
                </p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import type { ArticleCardData } from "@/lib/services/articles";

export type ArticleCardVariant =
  "featured" | "vertical" | "horizontal" | "compact";

export interface ArticleCardProps {
  article: ArticleCardData;
  variant?: ArticleCardVariant;
  className?: string;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function CardMeta({
  article,
  className,
}: {
  article: ArticleCardData;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "text-foreground-muted flex items-center gap-2 text-xs",
        className,
      )}
    >
      <Avatar
        size="sm"
        fallback={article.author.name.charAt(0)}
        src={article.author.authorProfile?.avatarUrl ?? undefined}
        className="h-5 w-5"
      />
      <span>{article.author.name}</span>
      {article.publishedAt ? (
        <>
          <span aria-hidden>&middot;</span>
          <time dateTime={article.publishedAt.toISOString()}>
            {formatDate(article.publishedAt)}
          </time>
        </>
      ) : null}
    </div>
  );
}

export function ArticleCard({
  article,
  variant = "vertical",
  className,
}: ArticleCardProps) {
  const href = `/article/${article.slug}`;

  if (variant === "featured") {
    return (
      <Link
        href={href}
        className={cn(
          "group border-border bg-surface-elevated grid gap-6 overflow-hidden rounded-lg border md:grid-cols-2",
          className,
        )}
      >
        <div className="bg-surface relative aspect-[16/10] overflow-hidden md:aspect-auto">
          {article.featuredImage ? (
            <ImageWithFallback
              src={article.featuredImage}
              unoptimized
              alt=""
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              priority
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : null}
        </div>
        <div className="flex flex-col justify-center gap-3 p-6">
          {article.category ? (
            <Badge variant="primary">{article.category.name}</Badge>
          ) : null}
          <h2 className="text-foreground font-serif text-2xl font-bold tracking-tight sm:text-3xl">
            {article.title}
          </h2>
          {article.excerpt ? (
            <p className="text-foreground-secondary line-clamp-3">
              {article.excerpt}
            </p>
          ) : null}
          <CardMeta article={article} />
        </div>
      </Link>
    );
  }

  if (variant === "horizontal") {
    return (
      <Link
        href={href}
        className={cn(
          "group border-border bg-surface-elevated flex gap-4 rounded-lg border p-3",
          className,
        )}
      >
        <div className="bg-surface relative h-24 w-32 shrink-0 overflow-hidden rounded-md sm:h-28 sm:w-40">
          {article.featuredImage ? (
            <ImageWithFallback
              src={article.featuredImage}
              unoptimized
              alt=""
              fill
              sizes="160px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : null}
        </div>
        <div className="flex flex-1 flex-col justify-center gap-1.5">
          {article.category ? (
            <span className="text-primary text-xs font-medium">
              {article.category.name}
            </span>
          ) : null}
          <h3 className="text-foreground line-clamp-2 font-serif text-base font-semibold sm:text-lg">
            {article.title}
          </h3>
          <CardMeta article={article} />
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href={href}
        className={cn(
          "group border-border flex flex-col gap-1 border-b py-3",
          className,
        )}
      >
        <h3 className="text-foreground group-hover:text-primary line-clamp-2 text-sm font-medium">
          {article.title}
        </h3>
        <CardMeta article={article} />
      </Link>
    );
  }

  // vertical (default)
  return (
    <Link
      href={href}
      className={cn(
        "group border-border bg-surface-elevated flex flex-col gap-3 overflow-hidden rounded-lg border",
        className,
      )}
    >
      <div className="bg-surface relative aspect-[16/9] overflow-hidden">
        {article.featuredImage ? (
          <ImageWithFallback
            src={article.featuredImage}
            unoptimized
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 pt-0">
        {article.category ? (
          <span className="text-primary text-xs font-medium">
            {article.category.name}
          </span>
        ) : null}
        <h3 className="text-foreground line-clamp-2 font-serif text-lg font-semibold">
          {article.title}
        </h3>
        {article.excerpt ? (
          <p className="text-foreground-secondary line-clamp-2 text-sm">
            {article.excerpt}
          </p>
        ) : null}
        <CardMeta article={article} className="mt-auto pt-2" />
      </div>
    </Link>
  );
}

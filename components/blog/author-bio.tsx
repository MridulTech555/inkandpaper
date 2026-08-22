import Link from "next/link";
import { AtSign, Globe } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";

export interface AuthorBioData {
  name: string;
  slug: string;
  bio: string | null;
  avatarUrl: string | null;
  socialLinks?: unknown;
}

function parseSocialLinks(value: unknown): {
  twitter?: string;
  website?: string;
} {
  if (!value || typeof value !== "object") return {};
  const record = value as Record<string, unknown>;
  return {
    twitter: typeof record.twitter === "string" ? record.twitter : undefined,
    website: typeof record.website === "string" ? record.website : undefined,
  };
}

export interface AuthorBioProps {
  author: AuthorBioData;
  variant?: "compact" | "full";
  className?: string;
}

export function AuthorBio({
  author,
  variant = "compact",
  className,
}: AuthorBioProps) {
  const social = parseSocialLinks(author.socialLinks);
  const avatarSize = variant === "full" ? "lg" : "md";

  return (
    <div className={cn("flex items-start gap-4", className)}>
      <Avatar
        fallback={author.name.charAt(0)}
        src={author.avatarUrl ?? undefined}
        size={avatarSize}
      />
      <div className="flex flex-col gap-1.5">
        <Link
          href={`/author/${author.slug}`}
          className="text-foreground hover:text-primary font-medium"
        >
          {author.name}
        </Link>
        {author.bio ? (
          <p
            className={cn(
              "text-foreground-secondary text-sm",
              variant === "compact" && "line-clamp-2",
            )}
          >
            {author.bio}
          </p>
        ) : null}
        {social.twitter || social.website ? (
          <div className="flex items-center gap-3 pt-1">
            {social.twitter ? (
              <a
                href={social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="text-foreground-muted hover:text-foreground"
              >
                <AtSign className="h-4 w-4" />
              </a>
            ) : null}
            {social.website ? (
              <a
                href={social.website}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Website"
                className="text-foreground-muted hover:text-foreground"
              >
                <Globe className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

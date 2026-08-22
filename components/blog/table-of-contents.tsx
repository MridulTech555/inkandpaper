import { cn } from "@/lib/utils/cn";
import type { HeadingEntry } from "@/lib/services/articles";

export function TableOfContents({
  headings,
  className,
}: {
  headings: HeadingEntry[];
  className?: string;
}) {
  if (headings.length === 0) return null;

  return (
    <nav
      aria-label="Table of contents"
      className={cn("flex flex-col gap-2", className)}
    >
      <p className="text-foreground-muted text-xs font-medium tracking-wide uppercase">
        On this page
      </p>
      <ul className="flex flex-col gap-1.5 text-sm">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: (heading.level - 2) * 12 }}
          >
            <a
              href={`#${heading.id}`}
              className="text-foreground-secondary hover:text-foreground"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

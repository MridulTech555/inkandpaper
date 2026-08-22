"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { AUTHOR_NAV_ITEMS } from "@/components/author/author-nav-items";
import { createDraftArticleAction } from "@/lib/services/article-mutations";

const NAV_ITEM_CLASS =
  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors text-foreground-secondary hover:bg-surface hover:text-foreground";

export function AuthorNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {AUTHOR_NAV_ITEMS.map((item) => {
        const Icon = item.icon;

        // Creating a draft has to be a real form submission, not route
        // navigation — see components/author/write-article-button.tsx.
        if (item.href === "/author/articles/new") {
          return (
            <form key={item.href} action={createDraftArticleAction}>
              <button
                type="submit"
                onClick={onNavigate}
                className={cn("w-full", NAV_ITEM_CLASS)}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            </form>
          );
        }

        const active =
          item.href === "/author"
            ? pathname === "/author"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              NAV_ITEM_CLASS,
              active && "bg-surface text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

import Link from "next/link";
import { AuthorNavLinks } from "@/components/author/author-nav-links";

export function AuthorSidebar() {
  return (
    <aside className="border-border bg-surface hidden w-60 shrink-0 border-r p-4 md:flex md:flex-col">
      <Link
        href="/"
        className="text-foreground mb-6 px-3 font-serif text-lg font-semibold"
      >
        Ink &amp; Paper
      </Link>
      <AuthorNavLinks />
    </aside>
  );
}

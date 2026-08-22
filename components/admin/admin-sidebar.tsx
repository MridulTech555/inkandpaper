import Link from "next/link";
import { AdminNavLinks } from "@/components/admin/admin-nav-links";

export function AdminSidebar() {
  return (
    <aside className="border-border bg-surface hidden w-64 shrink-0 overflow-y-auto border-r p-4 md:flex md:flex-col">
      <Link
        href="/"
        className="text-foreground mb-6 px-3 font-serif text-lg font-semibold"
      >
        Ink &amp; Paper
      </Link>
      <AdminNavLinks />
    </aside>
  );
}

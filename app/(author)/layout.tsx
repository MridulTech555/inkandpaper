import type { ReactNode } from "react";
import { requireRole } from "@/lib/permissions/check";
import { AuthorSidebar } from "@/components/author/author-sidebar";
import { AuthorHeader } from "@/components/author/author-header";

export default async function AuthorSectionLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireRole("SUPER_ADMIN", "ADMIN", "EDITOR", "AUTHOR");

  return (
    <div className="flex min-h-full flex-1">
      <AuthorSidebar />
      <div className="flex flex-1 flex-col">
        <AuthorHeader user={user} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

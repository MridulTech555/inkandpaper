import type { ReactNode } from "react";
import { requireRole } from "@/lib/permissions/check";

/**
 * Deliberately minimal: no AuthorSidebar/AuthorHeader chrome. The block
 * editor owns its own distraction-free header (Back/Save status/Preview/
 * Publish) instead of inheriting the dashboard shell.
 */
export default async function EditorSectionLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRole("SUPER_ADMIN", "ADMIN", "EDITOR", "AUTHOR");
  return <div className="bg-background min-h-full">{children}</div>;
}

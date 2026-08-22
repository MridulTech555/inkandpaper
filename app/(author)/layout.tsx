import type { ReactNode } from "react";
import { requireRole } from "@/lib/permissions/check";

export default async function AuthorSectionLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRole("SUPER_ADMIN", "ADMIN", "EDITOR", "AUTHOR");
  return <>{children}</>;
}

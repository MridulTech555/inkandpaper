import type { ReactNode } from "react";
import { requireRole } from "@/lib/permissions/check";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export default async function AdminSectionLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireRole("SUPER_ADMIN", "ADMIN");

  return (
    <div className="flex min-h-full flex-1">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <AdminHeader user={user} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  ADMIN_DASHBOARD_ITEM,
  ADMIN_NAV_GROUPS,
} from "@/components/admin/admin-nav-items";

function isActive(pathname: string, href: string): boolean {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-surface text-foreground"
          : "text-foreground-secondary hover:bg-surface hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

export function AdminNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(),
  );

  function toggleGroup(label: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  }

  return (
    <nav className="flex flex-col gap-4">
      <NavLink
        href={ADMIN_DASHBOARD_ITEM.href}
        label={ADMIN_DASHBOARD_ITEM.label}
        icon={ADMIN_DASHBOARD_ITEM.icon}
        active={isActive(pathname, ADMIN_DASHBOARD_ITEM.href)}
        onNavigate={onNavigate}
      />

      {ADMIN_NAV_GROUPS.map((group) => {
        const collapsed = collapsedGroups.has(group.label);
        return (
          <div key={group.label} className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => toggleGroup(group.label)}
              aria-expanded={!collapsed}
              className="text-foreground-muted hover:text-foreground-secondary flex items-center justify-between rounded-md px-3 py-1 text-xs font-medium tracking-wide uppercase"
            >
              {group.label}
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  collapsed && "-rotate-90",
                )}
              />
            </button>
            {collapsed ? null : (
              <div className="flex flex-col gap-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    active={isActive(pathname, item.href)}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

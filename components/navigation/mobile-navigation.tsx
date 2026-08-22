"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { LogoutButton } from "@/components/auth/logout-button";
import type { PublicNavUser } from "@/types/navigation";

const CATEGORY_LINKS = [
  { label: "Technology", href: "/category/technology" },
  { label: "Culture", href: "/category/culture" },
  { label: "Travel", href: "/category/travel" },
];

export function MobileNavigation({ user }: { user: PublicNavUser | null }) {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent side="right">
        <DrawerTitle className="text-foreground text-base font-semibold">
          Menu
        </DrawerTitle>
        <nav className="mt-6 flex flex-col gap-1">
          <Link
            href="/search"
            className="text-foreground hover:bg-surface rounded-md px-3 py-2 text-sm"
            onClick={() => setOpen(false)}
          >
            Search
          </Link>
          <p className="text-foreground-muted mt-4 px-3 text-xs font-medium tracking-wide uppercase">
            Categories
          </p>
          {CATEGORY_LINKS.map((category) => (
            <Link
              key={category.href}
              href={category.href}
              className="text-foreground hover:bg-surface rounded-md px-3 py-2 text-sm"
              onClick={() => setOpen(false)}
            >
              {category.label}
            </Link>
          ))}
        </nav>
        <div className="border-border mt-6 border-t pt-4">
          {user ? (
            <div className="flex flex-col gap-1">
              {["SUPER_ADMIN", "ADMIN", "EDITOR", "AUTHOR"].includes(
                user.role,
              ) ? (
                <Link
                  href="/author"
                  className="text-foreground hover:bg-surface rounded-md px-3 py-2 text-sm"
                  onClick={() => setOpen(false)}
                >
                  Author dashboard
                </Link>
              ) : null}
              {["SUPER_ADMIN", "ADMIN"].includes(user.role) ? (
                <Link
                  href="/admin"
                  className="text-foreground hover:bg-surface rounded-md px-3 py-2 text-sm"
                  onClick={() => setOpen(false)}
                >
                  Admin dashboard
                </Link>
              ) : null}
              <div className="px-3 py-2">
                <LogoutButton />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 px-1">
              <Button asChild variant="outline" onClick={() => setOpen(false)}>
                <Link href="/auth/login">Log in</Link>
              </Button>
              <Button asChild onClick={() => setOpen(false)}>
                <Link href="/auth/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

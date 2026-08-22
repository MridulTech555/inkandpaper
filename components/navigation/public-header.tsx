import Link from "next/link";
import { Bookmark, Search } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { hasRole } from "@/lib/permissions/check";
import { Button } from "@/components/ui/button";
import { SimpleTooltip } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AccountMenu } from "@/components/navigation/account-menu";
import { MobileNavigation } from "@/components/navigation/mobile-navigation";
import type { PublicNavUser } from "@/types/navigation";

const CATEGORY_LINKS = [
  { label: "Technology", href: "/category/technology" },
  { label: "Culture", href: "/category/culture" },
  { label: "Travel", href: "/category/travel" },
];

export async function PublicHeader() {
  const sessionUser = await getCurrentUser();
  const user: PublicNavUser | null = sessionUser
    ? {
        name: sessionUser.name,
        email: sessionUser.email,
        role: sessionUser.role.name,
      }
    : null;

  return (
    <header className="border-border bg-background/95 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="text-foreground font-serif text-lg font-semibold"
        >
          Ink &amp; Paper
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                Categories
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {CATEGORY_LINKS.map((category) => (
                <DropdownMenuItem key={category.href} asChild>
                  <Link href={category.href}>{category.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex items-center gap-1">
          <SimpleTooltip label="Search">
            <Button asChild variant="ghost" size="icon">
              <Link href="/search" aria-label="Search">
                <Search className="h-4 w-4" />
              </Link>
            </Button>
          </SimpleTooltip>

          <SimpleTooltip label="Bookmarks">
            <Button variant="ghost" size="icon" aria-label="Bookmarks">
              <Bookmark className="h-4 w-4" />
            </Button>
          </SimpleTooltip>

          <div className="hidden md:block">
            {user ? (
              <AccountMenu
                user={user}
                canAuthor={hasRole(
                  sessionUser,
                  "SUPER_ADMIN",
                  "ADMIN",
                  "EDITOR",
                  "AUTHOR",
                )}
                canAdmin={hasRole(sessionUser, "SUPER_ADMIN", "ADMIN")}
              />
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/auth/login">Log in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/auth/register">Register</Link>
                </Button>
              </div>
            )}
          </div>

          <MobileNavigation user={user} />
        </div>
      </div>
    </header>
  );
}

import Link from "next/link";
import { Bookmark, Search } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { hasRole } from "@/lib/permissions/check";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { SimpleTooltip } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutButton } from "@/components/auth/logout-button";
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="focus-visible:ring-primary ml-1 rounded-full focus-visible:ring-2 focus-visible:outline-none"
                    aria-label="Account menu"
                  >
                    <Avatar fallback={user.name.charAt(0)} size="sm" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {user.name}
                    <span className="text-foreground-muted block text-xs font-normal">
                      {user.role}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {hasRole(
                    sessionUser,
                    "SUPER_ADMIN",
                    "ADMIN",
                    "EDITOR",
                    "AUTHOR",
                  ) ? (
                    <DropdownMenuItem asChild>
                      <Link href="/author">Author dashboard</Link>
                    </DropdownMenuItem>
                  ) : null}
                  {hasRole(sessionUser, "SUPER_ADMIN", "ADMIN") ? (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin dashboard</Link>
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={(event) => event.preventDefault()}
                    className="p-0"
                  >
                    <LogoutButton className="w-full px-2 py-1.5 text-left" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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

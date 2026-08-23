"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutButton } from "@/components/auth/logout-button";
import { AuthorRequestDialog } from "@/components/navigation/author-request-dialog";
import type { PublicNavUser } from "@/types/navigation";

export function AccountMenu({
  user,
  canAuthor,
  canAdmin,
}: {
  user: PublicNavUser;
  canAuthor: boolean;
  canAdmin: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="focus-visible:ring-primary ml-1 rounded-full focus-visible:ring-2 focus-visible:outline-none"
          aria-label="Account menu"
        >
          <Avatar
            fallback={user.name.charAt(0)}
            src={user.avatarUrl ?? undefined}
            size="sm"
          />
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
        <DropdownMenuItem asChild>
          <Link href="/account">Your account</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/bookmarks">Bookmarks</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/notifications">Notifications</Link>
        </DropdownMenuItem>
        {canAuthor ? (
          <DropdownMenuItem asChild>
            <Link href="/author">Author dashboard</Link>
          </DropdownMenuItem>
        ) : null}
        {canAdmin ? (
          <DropdownMenuItem asChild>
            <Link href="/admin">Admin dashboard</Link>
          </DropdownMenuItem>
        ) : null}
        {!canAuthor && user.role === "READER" ? <AuthorRequestDialog /> : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(event) => event.preventDefault()}
          className="p-0"
        >
          <LogoutButton className="w-full px-2 py-1.5 text-left" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
